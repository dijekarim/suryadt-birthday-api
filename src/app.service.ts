import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getTimezones() {
    return moment.tz.names();
  }
}
