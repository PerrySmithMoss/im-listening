"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("../entities/Post");
const isAuth_1 = require("../middleware/isAuth");
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    type_graphql_1.Field(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    type_graphql_1.ObjectType()
], PaginatedPosts);
let PostResolver = class PostResolver {
    getPosts(ctx, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxLimit = Math.min(6, limit);
            const maxLimitPlusOne = maxLimit + 1;
            if (cursor) {
                const posts = yield ctx.prisma.post.findMany({
                    where: {
                        createdAt: {
                            lt: cursor,
                        },
                    },
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
                    take: maxLimitPlusOne,
                    include: {
                        author: {
                            include: {
                                profile: true,
                            },
                        },
                        songGenres: true,
                    },
                });
                return {
                    posts: posts.slice(0, maxLimit),
                    hasMore: posts.length === maxLimitPlusOne,
                };
            }
            else {
                const posts = yield ctx.prisma.post.findMany({
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
                    take: maxLimitPlusOne,
                    include: {
                        author: {
                            include: {
                                profile: true,
                            },
                        },
                        songGenres: true,
                    },
                });
                return {
                    posts: posts.slice(0, maxLimit),
                    hasMore: posts.length === maxLimitPlusOne,
                };
            }
        });
    }
    getRecentPosts(ctx, limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxLimit = Math.min(6, limit);
            const maxLimitPlusOne = maxLimit + 1;
            if (cursor) {
                const posts = yield ctx.prisma.post.findMany({
                    where: {
                        createdAt: {
                            lt: cursor,
                        },
                    },
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
                    take: maxLimitPlusOne,
                    include: {
                        author: {
                            include: {
                                profile: true,
                            },
                        },
                        songGenres: true,
                    },
                });
                return {
                    posts: posts.slice(0, maxLimit),
                    hasMore: posts.length === maxLimitPlusOne,
                };
            }
            else {
                const posts = yield ctx.prisma.post.findMany({
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
                    take: maxLimitPlusOne,
                    include: {
                        author: {
                            include: {
                                profile: true,
                            },
                        },
                        songGenres: true,
                    },
                });
                return {
                    posts: posts.slice(0, maxLimit),
                    hasMore: posts.length === maxLimitPlusOne,
                };
            }
        });
    }
    getPost(id, ctx) {
        return ctx.prisma.post.findUnique({
            where: {
                id: id,
            },
            include: {
                author: {
                    include: {
                        profile: true,
                    },
                },
                songGenres: true,
            },
        });
    }
    createPost(ctx, albumName, artistName, rating, title, genre, genres, previewSongUrl, albumImage) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield ctx.prisma.post.create({
                data: {
                    albumName,
                    artistName,
                    rating,
                    title,
                    genre,
                    previewSongUrl,
                    albumImage: albumImage,
                    authorId: ctx.req.session.userId,
                },
            });
            yield ctx.prisma.$transaction(genres.map((genre) => ctx.prisma.songGenre.create({
                data: {
                    genre: genre,
                    postId: post.id,
                },
            })));
            return post;
        });
    }
    updatePost(ctx, id, rating) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield ctx.prisma.post.findUnique({ where: { id: id } });
            if (!post) {
                return null;
            }
            else {
                return ctx.prisma.post.update({
                    where: { id: id },
                    data: { rating: rating },
                });
            }
        });
    }
    deletePost(ctx, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const post = yield ctx.prisma.post.findUnique({ where: { id: id } });
                if (!post) {
                    return false;
                }
                if (post.authorId !== ctx.req.session.userId) {
                    throw new Error("You can only delete posts which belong to you.");
                }
                yield ctx.prisma.post.delete({
                    where: {
                        id: id,
                    },
                });
            }
            catch (err) {
                console.log(err);
                return false;
            }
            return true;
        });
    }
    filterPosts(ctx, limit, cursor, genres) {
        return __awaiter(this, void 0, void 0, function* () {
            const maxLimit = Math.min(6, limit);
            const maxLimitPlusOne = maxLimit + 1;
            if (cursor) {
                const posts = yield ctx.prisma.post.findMany({
                    where: {
                        createdAt: {
                            lt: cursor,
                        },
                        // Find all posts which match the genres passed in as an argument
                        OR: [
                            {
                                genre: {
                                    in: genres,
                                },
                            },
                            {
                                songGenres: {
                                    some: {
                                        genre: {
                                            in: genres,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
                    take: maxLimitPlusOne,
                    include: {
                        author: {
                            include: {
                                profile: true,
                            },
                        },
                        songGenres: true,
                    },
                });
                return {
                    posts: posts.slice(0, maxLimit),
                    hasMore: posts.length === maxLimitPlusOne,
                };
            }
            else {
                const posts = yield ctx.prisma.post.findMany({
                    orderBy: [
                        {
                            createdAt: "desc",
                        },
                    ],
                    where: {
                        // Find all genres which match the genres passed in as an argument
                        OR: [
                            {
                                genre: {
                                    in: genres,
                                },
                            },
                            {
                                songGenres: {
                                    some: {
                                        genre: {
                                            in: genres,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    take: maxLimitPlusOne,
                    include: {
                        author: {
                            include: {
                                profile: true,
                            },
                        },
                        songGenres: true,
                    },
                });
                return {
                    posts: posts.slice(0, maxLimit),
                    hasMore: posts.length === maxLimitPlusOne,
                };
            }
        });
    }
};
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("cursor", () => Date, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPosts", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("cursor", () => Date, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getRecentPosts", null);
__decorate([
    type_graphql_1.Query(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PostResolver.prototype, "getPost", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("albumName")),
    __param(2, type_graphql_1.Arg("artistName")),
    __param(3, type_graphql_1.Arg("rating")),
    __param(4, type_graphql_1.Arg("title")),
    __param(5, type_graphql_1.Arg("genre")),
    __param(6, type_graphql_1.Arg("genres", () => [String])),
    __param(7, type_graphql_1.Arg("previewSongUrl", () => String || null, { nullable: true })),
    __param(8, type_graphql_1.Arg("albumImage")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, String, String, Array, Object, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id")),
    __param(2, type_graphql_1.Arg("rating")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    type_graphql_1.Query(() => PaginatedPosts),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("cursor", () => Date, { nullable: true })),
    __param(3, type_graphql_1.Arg("genres", () => [String])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, Array]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "filterPosts", null);
PostResolver = __decorate([
    type_graphql_1.Resolver()
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map