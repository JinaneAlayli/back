 import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
//import { Permission } from '@/permissions/permission.entity'; // path to be adjusted later
//import { User } from '@/users/user.entity'; // path to be adjusted later

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Later: Relationships with users and permissions
  // @OneToMany(() => User, user => user.role)
  // users: User[];

  // @OneToMany(() => Permission, permission => permission.role)
  // permissions: Permission[];
}
