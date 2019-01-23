import org.apache.spark.SparkContext
import org.apache.spark.SparkConf
import org.apache.spark.sql.{SQLContext, SparkSession}
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions._

object SpellsFinderSQL {

  def main(args: Array[String]): Unit = {

    // local[k] launch spark local & limit threads numbers
    val conf: SparkConf = new SparkConf()
                            .setAppName("SpellsFinderSQL")
                            .setMaster("local[2]")

    val ss: SparkSession = SparkSession
                                    .builder()
                                    .config(conf)
                                    .getOrCreate();
    val sc: SparkContext = ss.sparkContext
    val sl: SQLContext = ss.sqlContext

    import ss.implicits._

    // Reduce the amount of log
    ss.sparkContext.setLogLevel("ERROR")

    // Importing external json dataset
    val spellsDF = ss.read.option("multiLine", "true").json("./spells/spells.json")
    spellsDF.select("name").show(false)

    // Filtering all the spells
    val spellsDFFilter = spellsDF.filter(spellsDF("is_wizard") === true 
                          && spellsDF("level") <=4
                          && size(spellsDF("components")) === 1
                          && spellsDF("components")(0).contains("V"))

    println("Spells that PITO can use, are :")
    spellsDFFilter.select(($"name")).show
    sc.stop
  }
}
