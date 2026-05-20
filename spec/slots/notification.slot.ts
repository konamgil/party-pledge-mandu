// 🥟 Mandu Filling - notification Resource
// Pattern: /api/notifications
// 이 파일에서 비즈니스 로직을 구현하세요.

import { Mandu } from "@mandujs/core";
import contract from "../contracts/notification.contract";

export default Mandu.filling()
  // 📋 List Notifications
  .get(async (ctx) => {
    const input = await ctx.input(contract, "GET", ctx.params);
    const { page, limit } = input;

    // TODO: Implement database query
    // const offset = (page - 1) * limit;
    // const items = await db.select().from(notifications).limit(limit).offset(offset);
    // const total = await db.select({ count: count() }).from(notifications);

    const mockData = {
      data: [], // Replace with actual data
      pagination: {
        page,
        limit,
        total: 0,
      },
    };

    return ctx.output(contract, 200, mockData);
  })

  // 📄 Get Single Notification
  .get(async (ctx) => {
    const { id } = ctx.params;

    // TODO: Implement database query
    // const item = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    // if (!item) return ctx.notFound("Notification not found");

    const mockData = {
      data: { id, message: "Notification details" }, // Replace with actual data
    };

    return ctx.output(contract, 200, mockData);
  })

  // ➕ Create Notification
  .post(async (ctx) => {
    const input = await ctx.input(contract, "POST", ctx.params);

    // TODO: Implement database insertion
    // const [created] = await db.insert(notifications).values(input).returning();

    const mockData = {
      data: { id: "new-id", ...input }, // Replace with actual created data
    };

    return ctx.output(contract, 201, mockData);
  })

  // ✏️ Update Notification
  .put(async (ctx) => {
    const { id } = ctx.params;
    const input = await ctx.input(contract, "PUT", ctx.params);

    // TODO: Implement database update
    // const [updated] = await db.update(notifications)
    //   .set(input)
    //   .where(eq(notifications.id, id))
    //   .returning();
    // if (!updated) return ctx.notFound("Notification not found");

    const mockData = {
      data: { id, ...input }, // Replace with actual updated data
    };

    return ctx.output(contract, 200, mockData);
  })

  // 🗑️ Delete Notification
  .delete(async (ctx) => {
    const { id } = ctx.params;

    // TODO: Implement database deletion
    // const deleted = await db.delete(notifications).where(eq(notifications.id, id));
    // if (!deleted) return ctx.notFound("Notification not found");

    return ctx.output(contract, 200, { data: { message: "Notification deleted" } });
  })

// 💡 Contract 기반 사용법:
// ctx.input(contract, "GET")  - Contract로 요청 검증 + 정규화
// ctx.output(contract, 200, data) - Contract로 응답 검증
// ctx.okContract(contract, data)  - 200 OK (Contract 검증)
// ctx.createdContract(contract, data) - 201 Created (Contract 검증)
//
// 💡 데이터베이스 연동 예시:
// const { data } = await db.select().from(notifications).where(eq(notifications.id, id));
// return ctx.output(contract, 200, { data });
