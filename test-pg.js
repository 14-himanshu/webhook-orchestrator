const { Pool } = require('pg');
try {
  const pool = new Pool({ connectionString: 'prisma+postgres://accelerate.prisma-data.net/?api_key=ey...' });
  console.log("Pool created successfully");
} catch(e) {
  console.error("Error:", e.message);
}
