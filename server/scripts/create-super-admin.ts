import prisma from '../prisma';

const SUPER_ADMIN_EMAIL = 'cvpark0920@gmail.com';

async function createSuperAdmin() {
  try {
    console.log(`🔍 Checking for user with email: ${SUPER_ADMIN_EMAIL}`);
    
    // 기존 사용자 확인
    let user = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
      include: {
        agency: true,
      },
    });

    if (user) {
      // 기존 사용자가 있는 경우 업데이트
      console.log(`✅ User found: ${user.name} (${user.email})`);
      console.log(`   Current role: ${user.role}`);
      console.log(`   Current status: ${user.status}`);
      
      if (user.role === 'super_admin' && user.status === 'active') {
        console.log('✅ User is already a super admin with active status');
        return;
      }

      console.log(`🔄 Updating user to super_admin...`);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'super_admin',
          status: 'active',
          agencyId: null, // 슈퍼관리자는 소속사 없음
        },
        include: {
          agency: true,
        },
      });
      
      console.log(`✅ User updated successfully:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
    } else {
      // 새 사용자 생성
      console.log(`📝 Creating new super admin user...`);
      
      const username = SUPER_ADMIN_EMAIL.split('@')[0];
      let uniqueUsername = username;
      let counter = 1;

      // username이 이미 존재하면 숫자 추가
      while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          name: 'Super Admin',
          email: SUPER_ADMIN_EMAIL,
          role: 'super_admin',
          status: 'active',
          agencyId: null, // 슈퍼관리자는 소속사 없음
          joinDate: new Date(),
        },
        include: {
          agency: true,
        },
      });
      
      console.log(`✅ Super admin user created successfully:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
    }

    await prisma.$disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createSuperAdmin();

