/**
 * Cache entry interface.
 */
interface CacheEntry {
    /**
     * When was this entry last ran.
     */
    lastRan: EpochTimeStamp

    /**
     * JSON string of the results of the query.
     */
    results: string
}

/**
 * Our cache list.
 */
interface CacheList
{
    /**
     * Dictionary of cache entries.
     */
    [key: string]: CacheEntry
}

/**
 * This class' purpose is to cache the results from mysql queries for efficiency.
 */
class CacheSystem {
    /**
     * Total number of entries cached off.
     */
    totalCacheEntries: number;

    /**
     * Our cache.
     */
    cache: CacheList;

    /**
     * Constructor of our {CacheSystem}
     * @param cacheEntries Maximum number of entries to cache before pruning.
     */
    constructor(cacheEntries: number) {
        this.totalCacheEntries = cacheEntries;
        this.cache = {};
    }

    /**
     * Handles checking if a key exists in our dictionary.
     * @param key Key to search for.
     * @returns True if it exists in the dictionary.
     */
    doesExistInDictionary(key: string) : boolean
    {
        return (key in this.cache);
    }

    /**
     * Gets the cache results (if any) for the query.
     * @param query The query we are running.
     * @returns Cached results if they exist.
     */
    getResultsFromCache(query: string) : any
    {
        if (this.doesExistInDictionary(query))
        {
            return this.cache[query].results;
        }

        return null;
    }

    /**
     * Handles adding a cache to our system.
     * @param query Query to add.
     * @param results Results of query to add.
     */
    addEntryToCache(query: string, results: any)
    {
        if (this.doesExistInDictionary(query))
        {
            // Is the query older than an hour?
            const currentTime = Date.now();
            if (currentTime - this.cache[query].lastRan > 60 * 60 * 1000)
            {
                this.cache[query].results = JSON.stringify(results);
                this.cache[query].lastRan = currentTime;
            }

            return;
        }

        this.cache[query] = { results: results, lastRan: Date.now()};
        if (Object.keys(this.cache).length > this.totalCacheEntries)
        {
            // Need to prune the least used cache entry.
            this.removeOldEntries();
        }
    }

    /**
     * Called to prune the entries.
     */
    removeOldEntries()
    {
        let oldestKey = "";
        const currentTime = Date.now();
        let oldestEntry: EpochTimeStamp = currentTime;
        Object.keys(this.cache).forEach((key: string) => {
            const cacheEntry: CacheEntry = this.cache[key];
            if (cacheEntry.lastRan < oldestEntry)
            {
                oldestKey = key;
                oldestEntry = cacheEntry.lastRan;
            }

            if ((currentTime - cacheEntry.lastRan) > 60 * 60 * 1000)
            {
                // Need to remove this key now.
                delete this.cache[key];
            }
        });

        if (this.doesExistInDictionary(oldestKey))
        {
            console.log("Removing: " + oldestKey);
            delete this.cache[oldestKey];
        }
    }
}

export default CacheSystem;