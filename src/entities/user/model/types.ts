export interface UserAddress {
  address: string
  city: string
  state: string
  country: string
  postalCode?: string
}

export interface UserCompany {
  department: string
  name: string
  title: string
  address?: UserAddress
}

export interface UserHair {
  color: string
  type: string
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  age: number
  gender: string
  phone: string
  image?: string
  birthDate?: string
  maidenName?: string
  bloodGroup?: string
  height?: number
  weight?: number
  eyeColor?: string
  hair?: UserHair
  university?: string
  address?: UserAddress
  company?: UserCompany
  role?: string
}

export type CreateUserDto = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'age' | 'gender' | 'phone'
>

export type UpdateUserDto = Partial<CreateUserDto>
