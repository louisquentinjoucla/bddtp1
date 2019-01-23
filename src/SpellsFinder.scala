import org.apache.spark.SparkContext
import org.apache.spark.SparkConf
import org.apache.spark.sql.{SQLContext, SparkSession}
import scala.collection.mutable.WrappedArray

object SpellsFinder {

  def main(args: Array[String]): Unit = {

		// local[k] launch spark local & limit threads numbers
		val conf: SparkConf = new SparkConf()
								.setAppName("SpellsFinder")
								.setMaster("local[2]")

		val ss: SparkSession = SparkSession
										.builder()
										.config(conf)
										.getOrCreate();
		val sc: SparkContext = ss.sparkContext
		val sl: SQLContext = ss.sqlContext

		// Reduce the amount of log
		ss.sparkContext.setLogLevel("ERROR")

		// Importing external json dataset
		val spellsRDD = ss.read.option("multiLine", "true").json("./spells/spells.json").rdd

		// Filtering all the spells
		val spellsRDDFilter = spellsRDD.filter((item) => {
			val compos =  item(0).asInstanceOf[WrappedArray[String]]
			item(2) == true && item(3).toString.toInt <= 4 && compos.length == 1 && compos(0) == "V"
		})

		println("Spells that PITO can use, are :")

		// Printing the available spells for pito
		spellsRDDFilter.foreach((item) => { 
			println("- " +  item(4))
		})

		sc.stop
  }
}
