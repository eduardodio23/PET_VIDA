import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pet_vida'
};

async function getConnection(config = DB_CONFIG) {
  return mysql.createConnection(config);
}

async function queryRows(sql, params = []) {
  const connection = await getConnection();
  const [rows] = await connection.execute(sql, params);
  await connection.end();
  return rows;
}

async function execute(sql, params = []) {
  const connection = await getConnection();
  const [result] = await connection.execute(sql, params);
  await connection.end();
  return result;
}

app.get('/api/agenda-hoje', async (req, res) => {
  try {
    const rows = await queryRows('SELECT * FROM vw_agenda_hoje');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/faturamento-mensal', async (req, res) => {
  try {
    let sql = 'SELECT * FROM vw_faturamento_mensal';
    const conditions = [];
    const params = [];

    if (req.query.ano) {
      conditions.push('ano = ?');
      params.push(req.query.ano);
    }
    if (req.query.mes) {
      conditions.push('mes = ?');
      params.push(req.query.mes);
    }
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const rows = await queryRows(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/animais-detalhados', async (req, res) => {
  try {
    const rows = await queryRows('SELECT * FROM vw_animais_detalhados');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/inadimplentes', async (req, res) => {
  try {
    const rows = await queryRows('SELECT * FROM vw_inadimplentes');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/financeiro', async (req, res) => {
  try {
    const [summary] = await queryRows(
      `SELECT
        COALESCE(SUM(CASE WHEN status = 'pago' THEN valor_pago ELSE 0 END), 0) AS total_recebido,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_pago ELSE 0 END), 0) AS total_pendente,
        COALESCE(SUM(CASE WHEN status = 'cancelado' THEN valor_pago ELSE 0 END), 0) AS total_cancelado,
        COUNT(*) AS total_pagamentos
      FROM pagamentos`
    );

    const [consultas] = await queryRows(
      `SELECT
        COUNT(*) AS total_consultas,
        SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS consultas_concluidas,
        SUM(CASE WHEN status = 'agendada' THEN 1 ELSE 0 END) AS consultas_agendadas,
        SUM(CASE WHEN status = 'em_atendimento' THEN 1 ELSE 0 END) AS consultas_em_atendimento
      FROM consultas`
    );

    res.json({ ...summary, ...consultas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/fluxo-caixa', async (req, res) => {
  try {
    const rows = await queryRows(
      `SELECT
        p.id_pagamento,
        p.consulta_id,
        c.data_hora,
        a.nome AS animal,
        p.valor_pago,
        p.forma_pagamento,
        p.status,
        p.data_pagamento
      FROM pagamentos p
      JOIN consultas c ON c.id_consulta = p.consulta_id
      JOIN animais a ON c.animal_id = a.id_animal
      ORDER BY p.data_pagamento DESC
      LIMIT 20`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/especies', async (req, res) => {
  try {
    const rows = await queryRows('SELECT id_especie AS id, nome FROM especies');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/veterinarios', async (req, res) => {
  try {
    const rows = await queryRows('SELECT id_veterinario AS id, nome FROM veterinarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tutores', async (req, res) => {
  try {
    const rows = await queryRows('SELECT id_tutor AS id, nome FROM tutores');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/animais', async (req, res) => {
  try {
    const rows = await queryRows('SELECT id_animal AS id, nome FROM animais');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/consultas', async (req, res) => {
  try {
    const rows = await queryRows('SELECT id_consulta AS id, data_hora FROM consultas ORDER BY data_hora DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/seed/consulta', async (req, res) => {
  try {
    const { animal_id, veterinario_id, data_hora, diagnostico, valor, status } = req.body;
    if (!animal_id || !veterinario_id || !data_hora || valor == null || !status) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes para consulta.' });
    }

    const result = await execute(
      'INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status) VALUES (?, ?, ?, ?, ?, ?)',
      [animal_id, veterinario_id, data_hora, diagnostico || null, valor, status]
    );

    res.json({ success: true, insertedId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/seed/pagamento', async (req, res) => {
  try {
    const { consulta_id, valor_pago, forma_pagamento, data_pagamento, status } = req.body;
    if (!consulta_id || valor_pago == null || !forma_pagamento || !data_pagamento || !status) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes para pagamento.' });
    }

    const result = await execute(
      'INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status) VALUES (?, ?, ?, ?, ?)',
      [consulta_id, valor_pago, forma_pagamento, data_pagamento, status]
    );

    res.json({ success: true, insertedId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/init-db', async (req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), 'pet_vida_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const connection = await getConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      multipleStatements: true
    });
    await connection.query(sql);
    await connection.end();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 4000;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
