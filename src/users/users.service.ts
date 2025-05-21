import { Injectable, BadRequestException, NotFoundException, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { User } from "./user.entity"
import { EmployeeInvite } from "../employee-invites/employee-invite.entity"
import * as bcrypt from "bcrypt"
import { Team } from "../teams/team.entity"

export type RequestUser = {
  id: number
  email: string
  role_id: number
  name: string
  company_id?: number
  team_id?: number
}

type SafeUser = Omit<User, "password">

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(EmployeeInvite)
    private inviteRepo: Repository<EmployeeInvite>,
    @InjectRepository(Team)
  private teamRepo: Repository<Team>,
  ) {}

  async create(userData: {
    email: string
    password: string
    name: string
    token?: string
    role_id?: number
    team_id?: number
    company_id?: number
    position?: string
  }): Promise<SafeUser> {
    this.logger.log(`Creating new user with email: ${userData.email}`)

    const existing = await this.userRepo.findOne({ where: { email: userData.email } })
    if (existing) {
      this.logger.warn(`Email already exists: ${userData.email}`)
      throw new BadRequestException("Email already exists")
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(userData.password, salt)

    const newUser = this.userRepo.create({
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      role_id: userData.role_id ?? 4,
      team_id: userData.team_id,
      company_id: userData.company_id,
      position: userData.position, // Save the position
    })

    this.logger.log("Saving new user to database")
    const saved = await this.userRepo.save(newUser)

    // If registering via invite -> mark it accepted
    if (userData.token) {
      const invite = await this.inviteRepo.findOne({ where: { token: userData.token } })
      if (invite) {
        invite.accepted = true
        await this.inviteRepo.save(invite)
        this.logger.log(`Invite marked as accepted for token: ${userData.token}`)
      }
    }

    const { password, ...safeUser } = saved
    this.logger.log(`User created successfully with ID: ${saved.id}`)
    return safeUser as SafeUser
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`)
    return this.userRepo.findOne({ where: { email } })
  }

  async findById(id: number): Promise<User | null> {
    this.logger.log(`Finding user by ID: ${id}`)
    const user = await this.userRepo.findOne({ where: { id } })

    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`)
    }

    return user
  }

  async comparePasswords(raw: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(raw, hashed)
  }

  async findAll(currentUser: RequestUser): Promise<SafeUser[]> {
    this.logger.log(`Finding users for user with role: ${currentUser.role_id}`)

    let users: User[] = []

    if (currentUser.role_id === 1) {
      users = await this.userRepo.find() // SuperAdmin
      this.logger.log("SuperAdmin: returning all users")
    } else if (currentUser.role_id === 2 || currentUser.role_id === 3) {
      if (!currentUser.company_id) {
        this.logger.warn("Admin/Manager user missing company_id, returning only self")
        users = await this.userRepo.find({ where: { id: currentUser.id } })
      } else {
        users = await this.userRepo.find({
          where: {
            company_id: currentUser.company_id,
            is_deleted: false,
          },
          relations: ["role", "team"],
        })
        this.logger.log(`Admin/Manager: returning users for company ID: ${currentUser.company_id}`)
      }
    } else if (currentUser.role_id === 4) {
      if (!currentUser.team_id) {
        this.logger.warn("Team Lead user missing team_id, returning only self")
        users = await this.userRepo.find({ where: { id: currentUser.id } })
      } else {
        users = await this.userRepo.find({ where: { team_id: currentUser.team_id } })
        this.logger.log(`Team Lead: returning users for team ID: ${currentUser.team_id}`)
      }
    } else {
      users = await this.userRepo.find({ where: { id: currentUser.id } })
      this.logger.log(`Regular user: returning only self`)
    }

    this.logger.log(`Found ${users.length} users`)
    return users.map(({ password, ...rest }) => rest)
  }

  async updateProfileImage(userId: number, imageUrl: string) {
    this.logger.log(`Updating profile image for user ${userId}`)

    const user = await this.findById(userId)
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    const oldImageUrl = user.profile_img

    await this.userRepo.update(userId, { profile_img: imageUrl })
    this.logger.log(`Profile image updated for user ${userId}`)

    return {
      message: "Profile image updated!",
      imageUrl,
      oldImageUrl,
    }
  }

  async update(id: number, data: Partial<User>) {
    this.logger.log(`Updating user ${id} with data: ${JSON.stringify(data)}`)

    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    if (data.password) {
      const salt = await bcrypt.genSalt()
      data.password = await bcrypt.hash(data.password, salt)
    }

    await this.userRepo.update(id, data)
    this.logger.log(`User ${id} updated successfully`)

    return this.userRepo.findOneBy({ id })
  }

  async delete(id: number) {
    this.logger.log(`Soft-deleting user ${id}`)

    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    //  Remove user from leader if needed
    await this.teamRepo.update({ leader: { id } }, { leader: undefined })

    user.is_deleted = true
    await this.userRepo.save(user)

    this.logger.log(`User ${id} marked as deleted (soft delete)`)

    return { message: `User ${id} marked as deleted` }
  }
}
