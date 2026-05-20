// 🥟 Mandu Filling - comment Resource
// Pattern: /api/comments
// 이 파일에서 비즈니스 로직을 구현하세요.

import { Mandu } from "@mandujs/core";
import contract from "../contracts/comment.contract";

export default Mandu.filling()
  // 📋 List Comments
  .get(async (ctx) => {
    const input = await ctx.input(contract, "GET", ctx.params);
    const { page, limit } = input;

    // TODO: Implement database query
    // const offset = (page - 1) * limit;
    // const items = await db.select().from(comments).limit(limit).offset(offset);
    // const total = await db.select({ count: count() }).from(comments);

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

  // 📄 Get Single Comment
  .get(async (ctx) => {
    const { id } = ctx.params;

    // TODO: Implement database query
    // const item = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    // if (!item) return ctx.notFound("Comment not found");

    const mockData = {
      data: { id, message: "Comment details" }, // Replace with actual data
    };

    return ctx.output(contract, 200, mockData);
  })

  // ➕ Create Comment
  .post(async (ctx) => {
    const input = await ctx.input(contract, "POST", ctx.params);

    // TODO: Implement database insertion
    // const [created] = await db.insert(comments).values(input).returning();

    const mockData = {
      data: { id: "new-id", ...input }, // Replace with actual created data
    };

    return ctx.output(contract, 201, mockData);
  })

  // ✏️ Update Comment
  .put(async (ctx) => {
    const { id } = ctx.params;
    const input = await ctx.input(contract, "PUT", ctx.params);

    // TODO: Implement database update
    // const [updated] = await db.update(comments)
    //   .set(input)
    //   .where(eq(comments.id, id))
    //   .returning();
    // if (!updated) return ctx.notFound("Comment not found");

    const mockData = {
      data: { id, ...input }, // Replace with actual updated data
    };

    return ctx.output(contract, 200, mockData);
  })

  // 🗑️ Delete Comment
  .delete(async (ctx) => {
    const { id } = ctx.params;

    // TODO: Implement database deletion
    // const deleted = await db.delete(comments).where(eq(comments.id, id));
    // if (!deleted) return ctx.notFound("Comment not found");

    return ctx.output(contract, 200, { data: { message: "Comment deleted" } });
  })

// 💡 Contract 기반 사용법:
// ctx.input(contract, "GET")  - Contract로 요청 검증 + 정규화
// ctx.output(contract, 200, data) - Contract로 응답 검증
// ctx.okContract(contract, data)  - 200 OK (Contract 검증)
// ctx.createdContract(contract, data) - 201 Created (Contract 검증)
//
// 💡 데이터베이스 연동 예시:
// const { data } = await db.select().from(comments).where(eq(comments.id, id));
// return ctx.output(contract, 200, { data });
