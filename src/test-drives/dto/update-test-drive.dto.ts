import { PartialType } from '@nestjs/mapped-types';
import { CreateTestDriveDto } from './create-test-drive.dto';

export class UpdateTestDriveDto extends PartialType(CreateTestDriveDto) {}
