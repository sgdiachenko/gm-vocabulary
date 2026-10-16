import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ collection: 'users' })
export class Auth {
  @Prop({ type: String, required: true, unique: true, trim: true, lowercase: true })
  email!: string;

  // Optional in storage until legacy accounts next log in. Required by SignupDto.
  @Prop({ type: String, trim: true })
  username?: string;

  @Prop({ type: String, required: true })
  password!: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
