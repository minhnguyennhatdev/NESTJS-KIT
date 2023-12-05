const origins = ['localhost:3000'];

export default {
  origin: (origin: string, callback: any) => {
    if (!origin || origins.includes(origin)) {
      callback(null, true);
    } else {
      callback('Access not allowed', false);
    }
  },
  credentials: true,
};
