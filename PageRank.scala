import org.apache.spark.SparkContext
import org.apache.spark.SparkConf
import org.apache.spark.sql.{SQLContext, SparkSession}
import scala.collection.mutable.WrappedArray

case class Page(name: String, pageRank: Double, adjlist:Array[String]);

object PageRank {

  def main(args: Array[String]): Unit = {

    val MAX_ITER_PR: Int = 20;
    val DAMPING : Double = 0.85;

	// local[k] launch spark local & limit threads numbers
	val conf: SparkConf = new SparkConf()
							.setAppName("SpellsFinder")
							.setMaster("local[2]")

	val ss: SparkSession = SparkSession
                            .builder()
                            .config(conf)
                            .getOrCreate();
	val sc: SparkContext = ss.sparkContext

	// Reduce the amount of log
	ss.sparkContext.setLogLevel("ERROR")

    // Creating the graph
    var pageA : Page = new Page("A", 1d, Array("B", "C"));
    var pageB : Page = new Page("B", 1d, Array("C"));
    var pageC : Page = new Page("C", 1d, Array("A"));
    var pageD : Page = new Page("D", 1d, Array("C"));
    var graph : Array[Page] = Array(pageA, pageB, pageC, pageD);

    // Putting the graph in a RDD
    val rddGraph = sc.parallelize(graph);

    // PageRank
    var i = 0;
    var ranks = rddGraph.map((page) => {
           (page.name, 1d);
    });

    var array = rddGraph.map((page) => {
           (page.name, page.adjlist);
    });

    var pages = rddGraph.map((page) => {
           (page.name, 0d);
    });


    for(i <- 0 until MAX_ITER_PR) {
        println("Iteration " + (i+1));
        var outlinks = ranks.join(array).values.flatMap{case (rank,array) =>
            array.map(url => (url, rank / array.size))
        };

        var contribs = pages.union(outlinks);

        ranks = contribs.reduceByKey(_ + _).map{case(url, pr) => (url, (1-DAMPING) + DAMPING * pr)};
        ranks.foreach(println)
    }
	sc.stop
  }
}
