import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/user-role.enum';

import { TeamController } from './team.controller';

describe('TeamController (권한 가드 메타데이터)', () => {
  const reflector = new Reflector();

  const expectAdminStaffOnly = (handler: (...args: never[]) => unknown) => {
    const roles = reflector.get<UserRole[]>(ROLES_KEY, handler);
    expect(roles).toEqual([UserRole.ADMIN, UserRole.STAFF]);
  };

  it('GET /teams는 ADMIN/STAFF 전용으로 표시된다', () => {
    expectAdminStaffOnly(TeamController.prototype.findAll);
  });

  it('GET /teams/:id는 ADMIN/STAFF 전용으로 표시된다', () => {
    expectAdminStaffOnly(TeamController.prototype.findOne);
  });

  it('POST /teams는 ADMIN/STAFF 전용으로 표시된다', () => {
    expectAdminStaffOnly(TeamController.prototype.create);
  });

  it('PATCH /teams/:id는 ADMIN/STAFF 전용으로 표시된다', () => {
    expectAdminStaffOnly(TeamController.prototype.update);
  });

  it('DELETE /teams/:id는 ADMIN/STAFF 전용으로 표시된다', () => {
    expectAdminStaffOnly(TeamController.prototype.remove);
  });
});
