-- DropForeignKey
ALTER TABLE "CalorieHistory" DROP CONSTRAINT "CalorieHistory_userId_fkey";

-- AddForeignKey
ALTER TABLE "CalorieHistory" ADD CONSTRAINT "CalorieHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
