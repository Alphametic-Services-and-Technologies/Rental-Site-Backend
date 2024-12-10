import appDataSource from '../config/dataSource';
import { User, UserRole } from '../entities/User';

const seedDefaultAdmin = async () => {
  const userRepository = appDataSource.getRepository(User);

  const existingAdmin = await userRepository.findOneBy({
    role: UserRole.Admin,
  });

  if (existingAdmin) {
    console.log('Default admin is already created');
    return;
  }

  const newAdmin = userRepository.create({
    name: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    gender: 'male',
    role: UserRole.Admin,
    password: process.env.ADMIN_PASSWORD,
  });

  const createdAdmin = await userRepository.save(newAdmin);

  console.log('new Admin created: ', createdAdmin);
};

export default seedDefaultAdmin;
