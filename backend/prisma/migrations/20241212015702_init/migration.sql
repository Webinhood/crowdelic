-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,
    "income" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "family_status" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "daily_routine" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,
    "goals" TEXT[],
    "frustrations" TEXT NOT NULL,
    "interests" TEXT[],
    "habits" TEXT NOT NULL,
    "digital_skills" TEXT NOT NULL,
    "spending_habits" TEXT NOT NULL,
    "decision_factors" TEXT NOT NULL,
    "personality_traits" TEXT NOT NULL,
    "background_story" TEXT NOT NULL,
    "traits" TEXT[],
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'pt',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "settings" JSONB NOT NULL,
    "topics" TEXT[],
    "persona_ids" TEXT[],
    "target_audience" JSONB NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "error" TEXT,
    "current_iteration" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "first_impression" TEXT NOT NULL,
    "benefits" TEXT[],
    "concerns" TEXT[],
    "decision_factors" TEXT[],
    "suggestions" TEXT[],
    "tags" JSONB NOT NULL,
    "personal_context" JSONB NOT NULL,
    "target_audience_alignment" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_messages" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "test_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
