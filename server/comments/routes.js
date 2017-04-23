"use strict";

const commentsService = require("./services");

module.exports = function (app) {
	app.post("/api/member/comment",  commentsService.create);
	app.patch("/api/member/comment/:id",  commentsService.edit);
	app.delete("/api/admin/comment/:id",  commentsService.deleteComment);
	app.get("/api/admin/comment/:id",  commentsService.get);
	app.get("/api/admin/comment",  commentsService.getAll);
	app.get("/api/public/bylabel/comment",  commentsService.getByLabel);
};
