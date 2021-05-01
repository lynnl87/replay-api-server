const env = process.env;
const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'bbcj5616',
    database: 'hots',
    insecureAuth: true
  },
  listPerPage: env.LIST_PER_PAGE || 10,
};


module.exports = config;