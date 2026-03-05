import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // In production you should provide this via Vercel env vars.
  throw new Error("MONGODB_URI environment variable is not set");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = globalCache;

/**
 * getMongooseConnection ensures that serverless function cold starts
 * do not create multiple parallel Mongoose connections on Vercel.
 *
 * It caches the connection object across invocations where possible.
 * If the connection fails, the cached promise is cleared so the next
 * invocation can retry instead of reusing a rejected promise.
 */
export async function getMongooseConnection(): Promise<typeof mongoose> {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(MONGODB_URI as string, {
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000, // Wait up to 15s for a server
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      })
      .catch((err) => {
        // Clear the cached promise so the next invocation retries
        globalCache.promise = null;
        throw err;
      });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
