import cluster, { Worker } from 'cluster';

interface ClusterOptions {
  maxClusters: number;
}

class ClusterManager {
  private static instance: ClusterManager;
  private maxClusters: number;

  private constructor(options: ClusterOptions) {
    this.maxClusters = options.maxClusters;
    this.initCluster();
  }

  public static getInstance(options: ClusterOptions): ClusterManager {
    if (!this.instance) {
      this.instance = new ClusterManager(options);
    }
    return this.instance;
  }

  private initCluster() {
    cluster.setupPrimary({
      exec: __filename,
    });

    for (let i = 0; i < this.maxClusters; i++) {
      this.spawnCluster();
    }
  }

  private spawnCluster() {
    if (Object.keys(cluster.workers).length < this.maxClusters) {
      const worker: Worker = cluster.fork();
      console.log(`Cluster ${worker.process.pid} started`);
    }
  }

  public sendMessageToCluster(clusterId: number, message: string) {
    const worker = cluster.workers[clusterId];
    if (worker) {
      worker.send(message);
    }
  }

  public listClusters() {
    return Object.keys(cluster.workers).map(Number);
  }
}

export default ClusterManager;
