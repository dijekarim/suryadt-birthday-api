import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { UserDto } from './dto/user.dto';
import * as moment from 'moment-timezone';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<any>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async getBirthdayUsers() {
    // Aggregate today birthday users with exac hour
    const pipeline = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $lte: [
                  { $dayOfMonth: '$birth_date' },
                  { $dayOfMonth: moment().toDate() },
                ],
              },
              {
                $lte: [
                  { $month: '$birth_date' },
                  { $month: moment().toDate() },
                ],
              },
              {
                $lte: [{ $hour: '$birth_date' }, { $hour: moment().toDate() }],
              },
              {
                $lt: ['$year_celebrated', { $year: moment().toDate() }],
              },
            ],
          },
        },
      },
    ];

    const results = await this.userModel
      .aggregate(pipeline, { sort: { birth_date: -1 } })
      .exec();
    const data = [];
    for (const result of results) {
      try {
        // send email notification to each users
        await this.emailService.sendBirthdayMail(
          result.email,
          result.first_name,
        );

        // update user.year_celebrated to current years
        // year_celebrated is flag to tell years of the users are already received the email
        const updated = await this.userModel.findOneAndUpdate(
          { _id: result._id },
          { $set: { year_celebrated: moment().year() } },
          { new: true },
        );
        data.push(updated);
      } catch (error) {
        console.error(error);
      }
    }

    return { status: 'success', data };
  }

  async create(payload: UserDto) {
    const validZone = this.validateZone(payload.timezone);
    if (validZone) {
      const birth_date_with_timezone = moment(payload.birth_date)
        .set('hours', this.configService.get('BD_HOURS', 9))
        .tz(payload.timezone);
      payload.birth_date = birth_date_with_timezone.toDate();
      const user = await this.userModel.findOneAndUpdate(
        {
          email: payload.email,
        },
        {
          $set: payload,
        },
        {
          upsert: true,
          new: true,
        },
      );
      return { status: 'success', data: user };
    } else {
      return { status: 'error', message: 'Your timezone is invalid.' };
    }
  }

  async update(payload: UserDto) {
    const validZone = this.validateZone(payload.timezone);
    if (validZone) {
      const birth_date_with_timezone = moment(payload.birth_date)
        .set('hours', this.configService.get('BD_HOURS', 9))
        .tz(payload.timezone);
      payload.birth_date = birth_date_with_timezone.toDate();

      // check new birth_date > now
      const today = moment();
      if (birth_date_with_timezone.month() > today.month()) {
        payload.year_celebrated = today.year() - 1;
      } else if (
        birth_date_with_timezone.month() === today.month() &&
        birth_date_with_timezone.date() > today.date()
      ) {
        payload.year_celebrated = today.year() - 1;
      }
      const user = await this.userModel.findOneAndUpdate(
        {
          email: payload.email,
        },
        {
          $set: {
            ...payload,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );
      return { status: 'success', data: user };
    } else {
      return { status: 'error', message: 'Your timezone is invalid.' };
    }
  }

  async delete(email: string) {
    const deleted = await this.userModel.deleteOne({
      email,
    });

    return { status: 'success', data: deleted };
  }

  validateZone(zone): boolean {
    const validZone = moment.tz
      .names()
      .findIndex((zoneName) => zoneName === zone);

    return validZone >= 0;
  }
}
