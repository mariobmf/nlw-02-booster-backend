import { Request, Response } from 'express';
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ISchedule {
  /* eslint-disable camelcase */
  week_day: number;
  from: string;
  to: string;
}
interface IClass {
  name: string;
  avatar: string;
  whatsapp: string;
  bio: string;
  subject: string;
  cost: number;
  schedule: ISchedule[];
}

class ClassController {
  public async store(request: Request, response: Response): Promise<Response> {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule,
    }: IClass = request.body;

    const trx = await db.transaction();
    try {
      const insertedUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const userId = insertedUsersIds[0];

      const insertedClassesIds = await trx('classes').insert({
        user_id: userId,
        subject,
        cost,
      });

      const classId = insertedClassesIds[0];

      const classSchedule = schedule.map((scheduleItem) => {
        return {
          class_id: classId,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to),
        };
      });

      await trx('class_schedule').insert(classSchedule);

      await trx.commit();

      return response.status(201).send();
    } catch (error) {
      await trx.rollback();
      return response.status(400).json({
        error: 'Unexpected error while creating new class',
      });
    }
  }
}
export default new ClassController();
