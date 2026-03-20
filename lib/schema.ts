import { pgTable, serial, text, timestamp, pgEnum, customType } from 'drizzle-orm/pg-core';

export const visibilityEnum = pgEnum('visibility', ['public', 'private', 'password']);

export const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return 'bytea';
  },
});

export const tools = pgTable('tools', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  html: text('html').notNull(),
  visibility: visibilityEnum('visibility').default('public').notNull(),
  password: text('password'),
  iconColor: text('icon_color'),
  iconImage: bytea('icon_image'),
  iconImageType: text('icon_image_type'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
