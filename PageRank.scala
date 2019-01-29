import org.apache.spark.SparkContext
import org.apache.spark.SparkConf
import org.apache.spark.sql.{SQLContext, SparkSession}
import scala.collection.mutable.WrappedArray

case class Page(pageRank: Double, adjlist:Array[Int]);

object PageRank {

  def main(args: Array[String]): Unit = {

    val MAX_ITER_PR = 1;

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
    var pageA : Page = new Page(0, Array(1, 2));
    var pageB : Page = new Page(0, Array(2));
    var pageC : Page = new Page(0, Array(0));
    var pageD : Page = new Page(0, Array(2));
    var graph : Array[Page] = Array(pageA, pageB, pageC, pageD);

    // Putting the graph in a RDD
    val rddGraph = sc.parallelize(graph);
    rddGraph.foreach(println);

    // PageRank
    var i = 0;

    for(i <- 0 until MAX_ITER_PR) {
        rddGraph.foreach((page) => {
            println(page);
        });
    }


	sc.stop
  }
}
