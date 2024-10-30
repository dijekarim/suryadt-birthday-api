export class UserDto {
  first_name: string;
  last_name?: string;
  email: string;
  birth_date: Date;
  location?: string;
  timezone: string;
  year_celebrated?: number;
}
