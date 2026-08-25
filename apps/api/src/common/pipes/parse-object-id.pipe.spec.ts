import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('should convert a valid string into an ObjectId', () => {
    const id = new Types.ObjectId();

    expect(pipe.transform(id.toString())).toEqual(id);
  });

  it('should reject an invalid ObjectId', () => {
    expect(() => pipe.transform('invalid-id')).toThrow(BadRequestException);
  });
});
