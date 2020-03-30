import {Module} from '@nestjs/common';
import {ReasonController} from "./reason.controller";

@Module({
  controllers: [ReasonController]
})
export class ReasonModule {
}
