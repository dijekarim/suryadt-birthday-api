import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class EmailService {
  private MAIL_URI = this.configService.get(
    'MAIL_URI',
    'https://email-service.digitalenvision.com.au',
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {}

  async sendBirthdayMail(email: string, first_name: string) {
    const sendEMailApi = this.http
      .post(`${this.MAIL_URI}/send-email`, {
        email: email,
        message: `Hey, ${first_name} it's your birthday.`,
      })
      .pipe(map((res) => res.data));
    return await lastValueFrom(sendEMailApi);
  }
}
