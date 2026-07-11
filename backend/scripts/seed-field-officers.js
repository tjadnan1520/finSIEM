const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const AREA_SEEDS = [
  ["Dhanmondi", "Dhaka Metro"],
  ["Uttara", "Dhaka North"],
  ["Zindabazar", "Sylhet"],
  ["Mirpur", "Dhaka Metro"],
  ["Gulshan", "Dhaka North"],
  ["Motijheel", "Dhaka Metro"],
  ["Agrabad", "Chattogram"],
  ["Nasirabad", "Chattogram"],
  ["Shaheb Bazar", "Rajshahi"],
  ["Sonadanga", "Khulna"],
  ["Nathullabad", "Barishal"],
  ["Jahaj Company", "Rangpur"],
  ["Town Hall", "Mymensingh"],
  ["Kandirpar", "Cumilla"],
  ["Chashara", "Narayanganj"],
  ["Joydebpur", "Gazipur"],
  ["Satmatha", "Bogura"],
  ["Kolatoli", "Cox's Bazar"],
  ["Monihar", "Jashore"],
  ["Savar", "Dhaka District"]
];

const PROVIDER_SEEDS = [
  ["bKash", "BKASH", "ACTIVE"],
  ["Nagad", "NAGAD", "ACTIVE"],
  ["Rocket", "ROCKET", "DELAYED_FEED"]
];

const AGENT_NAMES = [
  "Nadia Rahman", "Rafiq Islam", "Samira Begum", "Arif Hasan", "Jannat Sultana",
  "Kamrul Ahsan", "Sadia Chowdhury", "Tanvir Ahmed", "Mehedi Karim", "Nusrat Jahan",
  "Hasan Mahmud", "Farida Akter", "Sabbir Hossain", "Mst. Runa Akter", "Aminul Islam",
  "Tania Parvin", "Rubel Mia", "Shahana Akter", "Masud Rana", "Lamia Ferdous"
];

const FIELD_OFFICER_NAMES = [
  "Mahir Alam", "Rumana Sultana", "Imran Hossain", "Nabila Islam", "Tasnia Ahmed",
  "Fahim Rahman", "Sakib Mahmud", "Afsana Karim", "Rifat Chowdhury", "Maliha Noor",
  "Nayeem Hasan", "Sanjida Akter", "Mahmudul Haque", "Khadija Begum", "Rakibul Islam",
  "Samiha Tasnim", "Anik Barua", "Sharmin Jahan", "Firoz Ahmed", "Mou Akter",
  "Saiful Karim", "Tasmia Rahman", "Arafat Hossain", "Nishat Jahan", "Rashedul Alam",
  "Labiba Khan", "Omar Faruk", "Sadia Islam", "Biplob Das", "Mariya Sultana",
  "Touhidul Islam", "Farzana Yasmin", "Shovon Roy", "Sumaiya Akter", "Parvez Hossain",
  "Raisa Ahmed", "Iqbal Hossain", "Mim Akter", "Jubayer Hasan", "Nazia Rahman"
];

const slugEmail = (value) => value.replace(/[^a-z0-9]+/gi, ".").replace(/^\.+|\.+$/g, "").toLowerCase();
const providerKey = (code) => code.toLowerCase();
const fieldOfficerName = (index) => FIELD_OFFICER_NAMES[index] || `Field Officer ${String(index + 1).padStart(2, "0")}`;
const officerPhone = (index) => `+8801933${String(100101 + index).padStart(6, "0")}`;

const operatorSeed = (provider) => {
  const seeds = {
    BKASH: ["Bikash Dutta", "bkash.operator@finsiem.local"],
    NAGAD: ["Nasir Uddin", "nagad.operator@finsiem.local"],
    ROCKET: ["Rokeya Sultana", "rocket.operator@finsiem.local"]
  };
  return seeds[provider.code];
};

const officerEmail = (areaIndex, provider, name) => {
  if (areaIndex === 0 && provider.code === "BKASH") return "fieldofficer@finsiem.local";
  if (areaIndex === 1 && provider.code === "NAGAD") return "uttara.fieldofficer@finsiem.local";
  if (areaIndex === 2 && provider.code === "ROCKET") return "sylhet.fieldofficer@finsiem.local";
  return `${slugEmail(name)}.${providerKey(provider.code)}@finsiem.local`;
};

const officerCode = (areaIndex, provider) => {
  if (areaIndex === 0 && provider.code === "BKASH") return "FO-DHN-101";
  if (areaIndex === 1 && provider.code === "NAGAD") return "FO-UTR-204";
  if (areaIndex === 2 && provider.code === "ROCKET") return "FO-SYL-312";
  return `FO-${provider.code}-${String(areaIndex + 1).padStart(3, "0")}`;
};

const run = async () => {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const [fieldOfficerRole, operatorRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: "Field Officer" },
      update: { description: "Field operation user" },
      create: { name: "Field Officer", description: "Field operation user" }
    }),
    prisma.role.upsert({
      where: { name: "Operator" },
      update: { description: "Provider operations analyst and case investigator" },
      create: { name: "Operator", description: "Provider operations analyst and case investigator" }
    })
  ]);

  const providers = [];
  for (const [name, code, status] of PROVIDER_SEEDS) {
    providers.push(await prisma.provider.upsert({
      where: { code },
      update: { name, status },
      create: { name, code, status }
    }));
  }

  for (const provider of providers) {
    const [name, email] = operatorSeed(provider);
    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        isActive: true,
        roleId: operatorRole.id,
        operatorProviderId: provider.id,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
      },
      create: {
        name,
        email,
        passwordHash,
        roleId: operatorRole.id,
        operatorProviderId: provider.id,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
      }
    });
  }

  const legacyOperator = await prisma.user.findUnique({ where: { email: "operator@finsiem.local" } });
  if (legacyOperator) {
    await prisma.user.update({
      where: { id: legacyOperator.id },
      data: { roleId: operatorRole.id, operatorProviderId: providers.find((provider) => provider.code === "BKASH").id }
    });
  }

  for (const [areaIndex, [areaName, region]] of AREA_SEEDS.entries()) {
    const area = await prisma.area.upsert({
      where: { name: areaName },
      update: { region },
      create: { name: areaName, region }
    });

    const agentCode = `AG-${String(areaIndex + 1).padStart(3, "0")}`;
    const agent = await prisma.agent.upsert({
      where: { code: agentCode },
      update: {
        name: AGENT_NAMES[areaIndex],
        phone: `+8801722${String(100101 + areaIndex).padStart(6, "0")}`,
        areaId: area.id
      },
      create: {
        code: agentCode,
        name: AGENT_NAMES[areaIndex],
        phone: `+8801722${String(100101 + areaIndex).padStart(6, "0")}`,
        areaId: area.id
      }
    });

    await prisma.physicalCash.upsert({
      where: { agentId: agent.id },
      update: {
        areaId: area.id,
        balance: 40000 + areaIndex * 1500,
        minimumTarget: 25000
      },
      create: {
        agentId: agent.id,
        areaId: area.id,
        balance: 40000 + areaIndex * 1500,
        minimumTarget: 25000
      }
    });

    for (const [providerIndex, provider] of providers.entries()) {
      const officerIndex = areaIndex * providers.length + providerIndex;
      const name = fieldOfficerName(officerIndex);
      const email = officerEmail(areaIndex, provider, name);
      const code = officerCode(areaIndex, provider);

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
          isActive: true,
          roleId: fieldOfficerRole.id
        },
        create: {
          name,
          email,
          passwordHash,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
          roleId: fieldOfficerRole.id
        }
      });

      const existingProfile = await prisma.fieldOfficer.findUnique({ where: { userId: user.id } });
      if (existingProfile && existingProfile.code !== code) {
        await prisma.fieldOfficer.delete({ where: { id: existingProfile.id } });
      }

      await prisma.fieldOfficer.upsert({
          where: { code },
          update: {
          phone: officerPhone(officerIndex),
          isAvailable: true,
          userId: user.id,
          areaId: area.id,
          providerId: provider.id
        },
        create: {
          code,
          phone: officerPhone(officerIndex),
          isAvailable: true,
          userId: user.id,
          areaId: area.id,
          providerId: provider.id
        }
      });
    }
  }

  const [agentCount, officerCount, providerCount, operatorCount] = await Promise.all([
    prisma.agent.count({ where: { code: { not: { startsWith: "REMOVED-" } } } }),
    prisma.fieldOfficer.count({ where: { isAvailable: true, providerId: { not: null } } }),
    prisma.provider.count({ where: { code: { in: PROVIDER_SEEDS.map(([, code]) => code) } } }),
    prisma.user.count({ where: { role: { name: "Operator" }, operatorProviderId: { not: null } } })
  ]);

  console.log(`Seeded provider field network. Providers: ${providerCount}. Provider operators: ${operatorCount}. Agents: ${agentCount}. Provider field officers: ${officerCount}.`);
};

run()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
