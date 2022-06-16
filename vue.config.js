module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://api.stelpolvo.com', //对应服务器地址
                changeOrigin: true, /*允许跨域*/
                ws: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}
