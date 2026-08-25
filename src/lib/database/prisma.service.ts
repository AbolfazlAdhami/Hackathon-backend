import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import 'dotenv/config';

import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async onModuleInit() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'PARTICIPANT',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hackathon (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        startsAt TIMESTAMP NOT NULL,
        endsAt TIMESTAMP NOT NULL,
        isActive BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        authorId VARCHAR(255) REFERENCES "user"(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS hackathon_participant (
        id VARCHAR(255) PRIMARY KEY,
        hackathon_id VARCHAR(255) REFERENCES hackathon(id) ON DELETE CASCADE,
        user_id VARCHAR(255) REFERENCES "user"(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_participant UNIQUE (hackathon_id, user_id)
      );
    `);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  user = {
    findUnique: async (args: {
      where: { id?: string; email?: string };
      select?: any;
      include?: any;
    }) => {
      const field = args.where.email ? 'email' : 'id';
      const val = args.where.email || args.where.id;
      const res = await this.pool.query(
        `SELECT * FROM "user" WHERE ${field} = $1`,
        [val],
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      const user: any = {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
        hackathons: [],
      };

      if (args.include?.hackathons) {
        const hakRes = await this.pool.query(
          'SELECT * FROM hackathon WHERE authorId = $1',
          [user.id],
        );
        user.hackathons = hakRes.rows;
      }
      return user;
    },

    findMany: async (args?: { select?: any }) => {
      const res = await this.pool.query('SELECT * FROM "user"');
      return res.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
      }));
    },

    create: async (args: {
      data: { name: string; email: string; password: string; role?: string };
    }) => {
      const id = 'user_' + Math.random().toString(36).substring(2, 9);
      const res = await this.pool.query(
        'INSERT INTO "user" (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          id,
          args.data.name,
          args.data.email,
          args.data.password,
          args.data.role || 'PARTICIPANT',
        ],
      );
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
      };
    },
  };

  hackathon = {
    findMany: async (args?: { include?: any }) => {
      const res = await this.pool.query('SELECT * FROM hackathon');
      const results: any[] = [];
      for (const row of res.rows) {
        let author = null;
        if (args?.include?.author) {
          const authorRes = await this.pool.query(
            'SELECT id, name, email FROM "user" WHERE id = $1',
            [row.authorid],
          );
          author = authorRes.rows[0];
        }
        results.push({
          id: row.id,
          name: row.name,
          description: row.description,
          startsAt: row.startsat,
          endsAt: row.endsat,
          isActive: row.isactive,
          createdAt: row.createdat,
          updatedAt: row.updatedat,
          authorId: row.authorid,
          author,
        });
      }
      return results;
    },

    findUnique: async (args: { where: { id: string }; include?: any }) => {
      const res = await this.pool.query(
        'SELECT * FROM hackathon WHERE id = $1',
        [args.where.id],
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      let author = null;
      if (args?.include?.author) {
        const aRes = await this.pool.query(
          'SELECT id, name, email FROM "user" WHERE id = $1',
          [row.authorid],
        );
        author = aRes.rows[0];
      }
      let participants: any[] = [];
      if (args?.include?.participants) {
        const pRes = await this.pool.query(
          'SELECT p.*, u.id as uid, u.name as uname, u.email as uemail FROM hackathon_participant p JOIN "user" u ON p.user_id = u.id WHERE p.hackathon_id = $1',
          [row.id],
        );
        participants = pRes.rows.map((p) => ({
          id: p.id,
          user: { id: p.uid, name: p.uname, email: p.uemail },
        }));
      }
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        startsAt: row.startsat,
        endsAt: row.endsat,
        isActive: row.isactive,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
        authorId: row.authorid,
        author,
        participants,
      };
    },

    create: async (args: {
      data: {
        name: string;
        description?: string;
        startsAt: Date;
        endsAt: Date;
        authorId: string;
      };
    }) => {
      const id = 'hak_' + Math.random().toString(36).substring(2, 9);
      const res = await this.pool.query(
        'INSERT INTO hackathon (id, name, description, startsAt, endsAt, authorId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [
          id,
          args.data.name,
          args.data.description,
          args.data.startsAt,
          args.data.endsAt,
          args.data.authorId,
        ],
      );
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        startsAt: row.startsat,
        endsAt: row.endsat,
        isActive: row.isactive,
        createdAt: row.createdat,
        updatedAt: row.updatedat,
        authorId: row.authorid,
      };
    },
  };

  async $connect() {}
  async $disconnect() {}
}
