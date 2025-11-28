const { query } = require('../config/database');

class CommunityService {
    async getPosts(page = 1, limit = 20, category = '전체', sort = 'latest') {
        const offset = (page - 1) * limit;
        
        // 카테고리 필터
        let whereClause = '';
        let params = [limit, offset];
        
        if (category !== '전체') {
            whereClause = 'WHERE p.category = $3';
            params = [limit, offset, category];
        }
        
        // 정렬 조건
        let orderBy = 'p.created_at DESC'; // latest
        if (sort === 'popular') {
            orderBy = 'p.likes DESC, p.views DESC';
        } else if (sort === 'views') {
            orderBy = 'p.views DESC';
        }
        
        // 전체 개수 조회
        const countQuery = category === '전체'
            ? 'SELECT COUNT(*) FROM posts'
            : 'SELECT COUNT(*) FROM posts WHERE category = $1';
        const countParams = category === '전체' ? [] : [category];
        const countResult = await query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);
        
        // 게시글 목록 조회 (작성자 정보 포함)
        const postsQuery = `
            SELECT 
                p.id, p.title, p.category, p.content, p.views, p.likes, p.created_at,
                u.id as author_id, u.username as author_username, u.avatar_url as author_avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT $1 OFFSET $2
        `;
        
        const result = await query(postsQuery, params);
        
        // 인기 게시글 판단 (조회수 1000 이상 또는 좋아요 100 이상)
        const posts = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            category: row.category,
            excerpt: row.content.substring(0, 200) + '...', // 처음 200자만
            author: {
                id: row.author_id,
                username: row.author_username,
                avatar: row.author_avatar
            },
            createdAt: row.created_at,
            stats: {
                views: row.views,
                likes: row.likes,
                comments: 0 // TODO: 댓글 수 추가
            },
            isHot: row.views > 1000 || row.likes > 100
        }));
        
        return {
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems: totalItems
            }
        };
    }

    async getPostById(id) {
        // 조회수 증가
        await query('UPDATE posts SET views = views + 1 WHERE id = $1', [id]);
        
        // 게시글 조회
        const result = await query(
            `SELECT 
                p.*, 
                u.username as author_username, 
                u.avatar_url as author_avatar
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            const error = new Error('게시글을 찾을 수 없습니다');
            error.statusCode = 404;
            throw error;
        }
        
        const post = result.rows[0];
        
        return {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            author: {
                id: post.user_id,
                username: post.author_username,
                avatar: post.author_avatar
            },
            stats: {
                views: post.views,
                likes: post.likes,
                comments: 0
            },
            createdAt: post.created_at,
            updatedAt: post.updated_at
        };
    }

    async createPost(userId, postData) {
        const { title, content, category } = postData;
        
        const result = await query(
            `INSERT INTO posts (user_id, title, content, category)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, category, created_at`,
            [userId, title, content, category]
        );
        
        return {
            id: result.rows[0].id,
            title: result.rows[0].title,
            category: result.rows[0].category,
            createdAt: result.rows[0].created_at
        };
    }

    async updatePost(postId, userId, updateData) {
        // 권한 확인
        const checkResult = await query(
            'SELECT user_id FROM posts WHERE id = $1',
            [postId]
        );
        
        if (checkResult.rows.length === 0) {
            const error = new Error('게시글을 찾을 수 없습니다');
            error.statusCode = 404;
            throw error;
        }
        
        if (checkResult.rows[0].user_id !== userId) {
            const error = new Error('게시글을 수정할 권한이 없습니다');
            error.statusCode = 403;
            throw error;
        }
        
        // 업데이트
        const { title, content, category } = updateData;
        const result = await query(
            `UPDATE posts 
             SET title = $1, content = $2, category = $3, updated_at = NOW()
             WHERE id = $4
             RETURNING id, title, category, updated_at`,
            [title, content, category, postId]
        );
        
        return result.rows[0];
    }

    async deletePost(postId, userId) {
        // 권한 확인
        const checkResult = await query(
            'SELECT user_id FROM posts WHERE id = $1',
            [postId]
        );
        
        if (checkResult.rows.length === 0) {
            const error = new Error('게시글을 찾을 수 없습니다');
            error.statusCode = 404;
            throw error;
        }
        
        if (checkResult.rows[0].user_id !== userId) {
            const error = new Error('게시글을 삭제할 권한이 없습니다');
            error.statusCode = 403;
            throw error;
        }
        
        // 삭제
        await query('DELETE FROM posts WHERE id = $1', [postId]);
    }

    async searchPosts(keyword, page = 1) {
        const limit = 20;
        const offset = (page - 1) * limit;
        
        // 검색 (제목 또는 내용에서)
        const searchQuery = `
            SELECT 
                p.id, p.title, p.category, p.content, p.views, p.likes, p.created_at,
                u.username as author_username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.title ILIKE $1 OR p.content ILIKE $1
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const searchPattern = `%${keyword}%`;
        const result = await query(searchQuery, [searchPattern, limit, offset]);
        
        // 전체 검색 결과 수
        const countResult = await query(
            'SELECT COUNT(*) FROM posts WHERE title ILIKE $1 OR content ILIKE $1',
            [searchPattern]
        );
        const totalItems = parseInt(countResult.rows[0].count);
        
        return {
            posts: result.rows.map(row => ({
                id: row.id,
                title: row.title,
                category: row.category,
                excerpt: row.content.substring(0, 200) + '...',
                author: row.author_username,
                stats: {
                    views: row.views,
                    likes: row.likes
                },
                createdAt: row.created_at
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems: totalItems
            }
        };
    }
}

module.exports = new CommunityService();