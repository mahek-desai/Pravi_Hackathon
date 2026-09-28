import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const databaseUrl = new URL(process.env.DATABASE_URL ?? 'mysql://root:@localhost:3306/infragov');
const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password || ''),
  database: databaseUrl.pathname.replace(/^\//, ''),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding InfraGov Database...');

  // 1. Roles
  const roles = [
    { name: 'ADMIN', description: 'System Administrator with full access' },
    { name: 'ASSET_MANAGER', description: 'Departmental Asset Manager' },
    { name: 'FIELD_INSPECTOR', description: 'Field Inspection Officer' },
    { name: 'TECHNICIAN', description: 'Maintenance Technician' },
    { name: 'VIEWER', description: 'Read-only viewer' },
  ];

  const createdRoles: Record<string, string> = {};
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    createdRoles[role.name] = r.id;
  }

  // 2. Departments & Divisions
  const departmentsData = [
    {
      name: 'Roads & Buildings Department',
      code: 'RBD',
      divisions: ['Urban Roads Division', 'Highways Division', 'Bridges & Structure Division'],
    },
    {
      name: 'Electrical Department',
      code: 'ELE',
      divisions: ['Street Lighting Unit', 'Substation & Grid Unit', 'Public Energy Unit'],
    },
    {
      name: 'Water Supply Department',
      code: 'WSD',
      divisions: ['Distribution Pipeline Unit', 'Pumping Operations', 'Water Quality Control'],
    },
    {
      name: 'Drainage & Wastewater Department',
      code: 'DWD',
      divisions: ['Stormwater Management', 'Sewerage Systems Unit', 'STP Operations'],
    },
    {
      name: 'Urban Development Department',
      code: 'UDD',
      divisions: ['Public Amenities Division', 'Civic Buildings Division'],
    },
    {
      name: 'Public Safety & ICT Department',
      code: 'PSI',
      divisions: ['Smart City Surveillance Unit', 'Traffic Control ICT Unit', 'Emergency Networks'],
    },
    {
      name: 'Parks & Public Spaces Department',
      code: 'PPS',
      divisions: ['Horticulture Division', 'Recreation & Parks Division'],
    },
  ];

  const deptMap: Record<string, { id: string; divisions: Record<string, string> }> = {};

  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: {
        name: dept.name,
        code: dept.code,
        description: `${dept.name} responsible for municipal infrastructure.`,
      },
    });

    const divMap: Record<string, string> = {};
    for (const divName of dept.divisions) {
      const code = `${dept.code}-${divName.split(' ')[0].toUpperCase()}`;
      const div = await prisma.division.upsert({
        where: { code },
        update: {},
        create: {
          departmentId: d.id,
          name: divName,
          code,
          description: `${divName} under ${dept.name}`,
        },
      });
      divMap[divName] = div.id;
    }

    deptMap[dept.code] = { id: d.id, divisions: divMap };
  }

  // 3. Demo Users
  const passwordHash = await bcrypt.hash('demo123', 10);
  const usersData = [
    {
      name: 'Rajesh Kumar (Admin)',
      email: 'admin@govdemo.local',
      role: 'ADMIN',
      dept: 'RBD',
    },
    {
      name: 'Priya Sharma (Asset Manager)',
      email: 'manager@govdemo.local',
      role: 'ASSET_MANAGER',
      dept: 'RBD',
    },
    {
      name: 'Amit Patel (Field Inspector)',
      email: 'inspector@govdemo.local',
      role: 'FIELD_INSPECTOR',
      dept: 'ELE',
    },
    {
      name: 'Suresh Verma (Technician)',
      email: 'technician@govdemo.local',
      role: 'TECHNICIAN',
      dept: 'WSD',
    },
    {
      name: 'Anita Desai (Public Viewer)',
      email: 'viewer@govdemo.local',
      role: 'VIEWER',
      dept: 'UDD',
    },
  ];

  const userMap: Record<string, string> = {};
  for (const u of usersData) {
    const deptInfo = deptMap[u.dept];
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        roleId: createdRoles[u.role],
        departmentId: deptInfo?.id || null,
      },
    });
    userMap[u.role] = createdUser.id;
  }

  // 4. Asset Categories & Types
  const categoriesData = [
    {
      name: 'Transport & Roads',
      code: 'TR',
      icon: 'Truck',
      types: [
        { name: 'Road Segment', code: 'RD' },
        { name: 'Highway Segment', code: 'HW' },
        { name: 'Bridge & Flyover', code: 'BR' },
        { name: 'Traffic Signal', code: 'TS' },
        { name: 'Footpath & Median', code: 'FP' },
      ],
    },
    {
      name: 'Electrical & Energy',
      code: 'EE',
      icon: 'Zap',
      types: [
        { name: 'Streetlight Pole', code: 'SL' },
        { name: 'Electrical Transformer', code: 'TRF' },
        { name: 'Distribution Substation', code: 'SUB' },
        { name: 'Public Lighting Panel', code: 'LP' },
      ],
    },
    {
      name: 'Water Supply',
      code: 'WS',
      icon: 'Droplet',
      types: [
        { name: 'Water Trunk Pipeline', code: 'WP' },
        { name: 'Water Pumping Station', code: 'WPS' },
        { name: 'Overhead Reservoir / Tank', code: 'WT' },
        { name: 'Control Valve', code: 'VLV' },
      ],
    },
    {
      name: 'Drainage & Wastewater',
      code: 'DW',
      icon: 'Waves',
      types: [
        { name: 'Storm Drain Network', code: 'SD' },
        { name: 'Sewer Line Pipeline', code: 'SLP' },
        { name: 'Manhole Chamber', code: 'MH' },
        { name: 'Sewage Pumping Station', code: 'SPS' },
      ],
    },
    {
      name: 'Buildings & Public Facilities',
      code: 'BF',
      icon: 'Building2',
      types: [
        { name: 'Government Complex Building', code: 'GB' },
        { name: 'Public Hospital Facility', code: 'GH' },
        { name: 'Municipal School Building', code: 'GS' },
        { name: 'Community Center / Hall', code: 'CC' },
      ],
    },
    {
      name: 'Public Safety & ICT',
      code: 'PS',
      icon: 'Shield',
      types: [
        { name: 'Smart CCTV Camera', code: 'CCTV' },
        { name: 'Emergency Warning Pole', code: 'EWP' },
        { name: 'Public Wi-Fi Hotspot', code: 'WIFI' },
      ],
    },
    {
      name: 'Parks & Public Spaces',
      code: 'PP',
      icon: 'Trees',
      types: [
        { name: 'Public Park Area', code: 'PRK' },
        { name: 'Children Playground', code: 'PLY' },
      ],
    },
  ];

  const catMap: Record<string, string> = {};
  const typeMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const c = await prisma.assetCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: {
        name: cat.name,
        code: cat.code,
        icon: cat.icon,
        description: `${cat.name} public assets category.`,
      },
    });
    catMap[cat.code] = c.id;

    for (const t of cat.types) {
      const at = await prisma.assetType.upsert({
        where: { code: t.code },
        update: {},
        create: {
          categoryId: c.id,
          name: t.name,
          code: t.code,
          description: `${t.name} infrastructure type.`,
        },
      });
      typeMap[t.code] = at.id;

      // Add default template schema
      await prisma.assetTemplate.create({
        data: {
          assetTypeId: at.id,
          name: `${t.name} Technical Specifications Schema`,
          schemaJson: JSON.stringify({
            fields: [
              { name: 'spec_standard', label: 'Specification Standard', type: 'text' },
              { name: 'installed_capacity', label: 'Installed Capacity/Size', type: 'text' },
              { name: 'material_grade', label: 'Material Grade', type: 'text' },
            ],
          }),
        },
      });
    }
  }

  // 5. Vendor Seed
  const vendor = await prisma.vendor.create({
    data: {
      name: 'L&T Infrastructure Contractors Ltd.',
      contactPerson: 'Mr. Arvind Sharma',
      phone: '+91 98765 43210',
      email: 'arvind.sharma@lntinfra.demo',
      address: 'SG Highway, Ahmedabad, Gujarat',
    },
  });

  // 6. Seed rich demo assets around Ahmedabad & Gandhinagar
  console.log('Generating 150+ realistic infrastructure assets across Ahmedabad & Gandhinagar...');

  const ahmedabadLocations = [
    { locality: 'Ashram Road', zone: 'West Zone', ward: 'Ward 12', lat: 23.0300, lng: 72.5800 },
    { locality: 'SG Highway', zone: 'West Zone', ward: 'Ward 15', lat: 23.0489, lng: 72.5180 },
    { locality: 'CG Road', zone: 'West Zone', ward: 'Ward 11', lat: 23.0250, lng: 72.5570 },
    { locality: 'Navrangpura', zone: 'West Zone', ward: 'Ward 10', lat: 23.0370, lng: 72.5520 },
    { locality: 'Maninagar', zone: 'South Zone', ward: 'Ward 08', lat: 22.9970, lng: 72.6010 },
    { locality: 'Bodakdev', zone: 'West Zone', ward: 'Ward 14', lat: 23.0380, lng: 72.5120 },
    { locality: 'Sabarmati Riverfront', zone: 'Central Zone', ward: 'Ward 01', lat: 23.0350, lng: 72.5780 },
    { locality: 'Gandhinagar Sector 11', zone: 'Capital Zone', ward: 'Ward 02', lat: 23.2150, lng: 72.6370 },
    { locality: 'GIFT City Zone', zone: 'Capital Zone', ward: 'Ward 05', lat: 23.1600, lng: 72.6840 },
    { locality: 'Satellite Area', zone: 'West Zone', ward: 'Ward 16', lat: 23.0280, lng: 72.5160 },
  ];

  let assetCounter = 1;
  const createdAssetIds: string[] = [];

  // Helper arrays for random asset generation
  const conditions = [95, 88, 76, 62, 45, 32, 25, 90, 82, 58];
  const criticalities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statusList = ['OPERATIONAL', 'OPERATIONAL', 'OPERATIONAL', 'UNDER_MAINTENANCE', 'OPERATIONAL'];

  const typeConfig = [
    { typeCode: 'RD', catCode: 'TR', deptCode: 'RBD', prefix: 'Road Segment - ' },
    { typeCode: 'TS', catCode: 'TR', deptCode: 'RBD', prefix: 'Traffic Signal Unit - ' },
    { typeCode: 'BR', catCode: 'TR', deptCode: 'RBD', prefix: 'Flyover Bridge - ' },
    { typeCode: 'SL', catCode: 'EE', deptCode: 'ELE', prefix: 'Smart LED Streetlight Pole - ' },
    { typeCode: 'TRF', catCode: 'EE', deptCode: 'ELE', prefix: 'Step-Down Transformer 11kV - ' },
    { typeCode: 'WP', catCode: 'WS', deptCode: 'WSD', prefix: 'Water Main Line 900mm - ' },
    { typeCode: 'WT', catCode: 'WS', deptCode: 'WSD', prefix: 'Overhead Reservoir 500KL - ' },
    { typeCode: 'SD', catCode: 'DW', deptCode: 'DWD', prefix: 'Stormwater Box Drain - ' },
    { typeCode: 'SPS', catCode: 'DW', deptCode: 'DWD', prefix: 'Sewage Lift Pumping Station - ' },
    { typeCode: 'GB', catCode: 'BF', deptCode: 'UDD', prefix: 'Municipal Civic Center - ' },
    { typeCode: 'CCTV', catCode: 'PS', deptCode: 'PSI', prefix: 'Surveillance PTZ Camera - ' },
    { typeCode: 'PRK', catCode: 'PP', deptCode: 'PPS', prefix: 'Community Public Park - ' },
  ];

  // Specific Rich Demo Asset 1: Traffic Signal TS-AHM-00021
  const locRich = await prisma.location.create({
    data: {
      address: 'CG Road Junction, Navrangpura',
      city: 'Ahmedabad',
      state: 'Gujarat',
      district: 'Ahmedabad',
      zone: 'West Zone',
      ward: 'Ward 11',
      locality: 'CG Road',
      latitude: 23.0255,
      longitude: 72.5572,
    },
  });

  const richTrafficSignal = await prisma.asset.create({
    data: {
      assetCode: 'TS-AHM-00021',
      name: 'High-Density Smart Traffic Signal TS-AHM-0021',
      categoryId: catMap['TR'],
      assetTypeId: typeMap['TS'],
      departmentId: deptMap['RBD'].id,
      divisionId: deptMap['RBD'].divisions['Urban Roads Division'],
      responsibleUserId: userMap['FIELD_INSPECTOR'],
      locationId: locRich.id,
      vendorId: vendor.id,
      lifecycleStatus: 'UNDER_MAINTENANCE',
      operationalStatus: 'FAILED',
      conditionScore: 31,
      conditionLabel: 'Critical',
      criticality: 'CRITICAL',
      riskScore: 88,
      riskLabel: 'Critical',
      installationDate: new Date('2021-03-15'),
      commissioningDate: new Date('2021-04-01'),
      expectedLifeYears: 10,
      purchaseCost: 450000,
      manufacturer: 'Siemens Mobility',
      model: 'ST-950-SmartController',
      serialNumber: 'SN-TS-2021-9981',
      description: 'Critical smart traffic signal controlling 4-way main intersection on CG Road.',
      technicalMetadataJson: JSON.stringify({
        pole_height: '6 meters',
        signal_type: 'Adaptive Smart LED',
        controller_version: 'v4.2',
      }),
    },
  });

  createdAssetIds.push(richTrafficSignal.id);

  // Add Rich Inspection for TS-AHM-00021
  await prisma.inspection.create({
    data: {
      assetId: richTrafficSignal.id,
      inspectorId: userMap['FIELD_INSPECTOR'],
      scheduledDate: new Date('2026-09-20'),
      inspectionDate: new Date('2026-09-22'),
      physicalConditionScore: 30,
      operationalConditionScore: 25,
      safetyScore: 38,
      overallScore: 31,
      observations: 'Severe signal controller board failure causing red-light flicker during rush hours.',
      recommendation: 'Immediate replacement of main PLC motherboard and power supply box.',
    },
  });

  // Add Rich Work Order for TS-AHM-00021
  const woRich = await prisma.workOrder.create({
    data: {
      workOrderNumber: 'WO-2026-00021',
      assetId: richTrafficSignal.id,
      createdById: userMap['ASSET_MANAGER'],
      assignedToId: userMap['TECHNICIAN'],
      issue: 'Signal Controller Motherboard Failure',
      description: 'Replace faulty PLC control board and recalibrate loop sensors.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-09-30'),
      estimatedCost: 35000,
    },
  });

  // Add Maintenance Record for TS-AHM-00021
  await prisma.maintenanceRecord.create({
    data: {
      assetId: richTrafficSignal.id,
      workOrderId: woRich.id,
      maintenanceType: 'CORRECTIVE',
      maintenanceDate: new Date('2026-09-24'),
      performedBy: 'Suresh Verma (Technician)',
      cost: 12000,
      description: 'Replaced power supply unit module. Control board replacement pending.',
      result: 'Partial repair complete',
    },
  });

  // Add Lifecycle Event for TS-AHM-00021
  await prisma.lifecycleEvent.create({
    data: {
      assetId: richTrafficSignal.id,
      eventType: 'MAINTENANCE_TRIGGERED',
      eventDate: new Date('2026-09-22'),
      performedById: userMap['FIELD_INSPECTOR'],
      oldStatus: 'OPERATIONAL',
      newStatus: 'UNDER_MAINTENANCE',
      description: 'Asset moved to Under Maintenance following critical inspection report.',
    },
  });

  // Add Policy for TS-AHM-00021
  await prisma.policy.create({
    data: {
      assetId: richTrafficSignal.id,
      policyType: 'AMC',
      provider: 'L&T Infrastructure Services',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-10-15'), // Expiring soon!
      coverage: 'Comprehensive maintenance & replacement within 4 hours SLA',
      slaResponseHours: 2,
      slaResolutionHours: 8,
      status: 'ACTIVE',
    },
  });

  // Add Critical Alert for TS-AHM-00021
  await prisma.alert.create({
    data: {
      assetId: richTrafficSignal.id,
      alertType: 'CRITICAL_RISK',
      severity: 'CRITICAL',
      title: 'Critical Risk Alert: Traffic Signal TS-AHM-0021',
      description: 'Condition dropped to 31 (Critical). Immediate repair required to prevent traffic congestion.',
      dueDate: new Date('2026-09-29'),
      status: 'OPEN',
    },
  });

  // Generate 160 more assets automatically
  for (let i = 2; i <= 165; i++) {
    const cfg = typeConfig[i % typeConfig.length];
    const locItem = ahmedabadLocations[i % ahmedabadLocations.length];
    const condition = conditions[i % conditions.length];
    const criticality = criticalities[i % criticalities.length];
    const operationalStatus = statusList[i % statusList.length];

    const loc = await prisma.location.create({
      data: {
        address: `${cfg.prefix} Segment #${i}, ${locItem.locality}`,
        city: 'Ahmedabad',
        state: 'Gujarat',
        district: 'Ahmedabad',
        zone: locItem.zone,
        ward: locItem.ward,
        locality: locItem.locality,
        latitude: locItem.lat + (Math.random() - 0.5) * 0.04,
        longitude: locItem.lng + (Math.random() - 0.5) * 0.04,
      },
    });

    const assetCode = `${cfg.typeCode}-AHM-${String(assetCounter++).padStart(5, '0')}`;
    const riskScore = Math.max(0, Math.min(100, Math.round((100 - condition) * 0.6 + (criticality === 'CRITICAL' ? 30 : 15))));

    const asset = await prisma.asset.create({
      data: {
        assetCode,
        name: `${cfg.prefix} ${locItem.locality} #${i}`,
        categoryId: catMap[cfg.catCode],
        assetTypeId: typeMap[cfg.typeCode],
        departmentId: deptMap[cfg.deptCode].id,
        responsibleUserId: userMap['FIELD_INSPECTOR'],
        locationId: loc.id,
        vendorId: vendor.id,
        lifecycleStatus: condition < 40 ? 'UNDER_MAINTENANCE' : 'OPERATIONAL',
        operationalStatus,
        conditionScore: condition,
        conditionLabel: condition >= 86 ? 'Excellent' : condition >= 71 ? 'Good' : condition >= 51 ? 'Fair' : condition >= 31 ? 'Poor' : 'Critical',
        criticality,
        riskScore,
        riskLabel: riskScore > 80 ? 'Critical' : riskScore > 60 ? 'High' : riskScore > 30 ? 'Medium' : 'Low',
        installationDate: new Date(2018 + (i % 6), (i % 12), 10),
        commissioningDate: new Date(2018 + (i % 6), (i % 12), 15),
        expectedLifeYears: 15,
        purchaseCost: 150000 + (i * 25000),
        manufacturer: 'L&T Infra Works',
        description: `Government infrastructure asset servicing ${locItem.locality} area.`,
      },
    });

    createdAssetIds.push(asset.id);

    // Add periodic inspections
    if (i % 3 === 0) {
      await prisma.inspection.create({
        data: {
          assetId: asset.id,
          inspectorId: userMap['FIELD_INSPECTOR'],
          inspectionDate: new Date(2026, 8, 1 + (i % 25)),
          physicalConditionScore: condition,
          operationalConditionScore: Math.min(100, condition + 5),
          safetyScore: Math.min(100, condition + 2),
          overallScore: condition,
          observations: condition < 50 ? 'Visible wear and tear requiring scheduled maintenance.' : 'Asset in normal operational state.',
        },
      });
    }

    // Add periodic alerts
    if (condition < 40 || riskScore > 75) {
      await prisma.alert.create({
        data: {
          assetId: asset.id,
          alertType: condition < 40 ? 'LOW_CONDITION' : 'HIGH_RISK',
          severity: riskScore > 80 ? 'CRITICAL' : 'HIGH',
          title: `Alert: ${asset.assetCode} requires attention`,
          description: `Condition score is ${condition}. Risk score calculated at ${riskScore}.`,
          status: 'OPEN',
        },
      });
    }
  }

  console.log('Seed finished successfully! Created 165+ realistic government infrastructure assets.');
}

main()
  .catch((e) => {
    console.error('Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
