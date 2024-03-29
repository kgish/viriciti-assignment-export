import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity()
@Unique([ 'username' ])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @OneToMany(type => Vehicle, vehicle => vehicle.user, { eager: true })
    vehicles: Vehicle[];

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }

    toString() {
        return `{ id='${ this.id }' username='${ this.username }' }`;
    }
}
