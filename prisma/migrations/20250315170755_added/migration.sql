-- CreateTable
CREATE TABLE "Dish" (
    "id" SERIAL NOT NULL,
    "dishName" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dish_pkey" PRIMARY KEY ("id")
);
