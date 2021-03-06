# TP1 de BDD repartie 



## Exercice 1

### Crawler

Le but de cette exercice est de réaliser un crawler recupérant les données d'un JdR. Le crawler a été realisé sous NodeJs, je vais décrire brievement sont fonctionnement.

Le premier plaisir de cette aventure, c'est la structure du site, qui n'est pas si pratique à crawler !
![architecture_web](https://i.imgur.com/hz2Q9CO.png)

On remarque d'entrée de jeu, que mis à part le heading, on a pas tellement de moyen de selectionner facilement les éléments. Plusieurs options s'offrent à nous:

1. Utilisation de regEx.
2. Sélection des enfants de .SpellDiv qui englobe toutes les données qui nous intéresse.

Autres problèmes, en fonction des pages, les ordres des enfants de .SpellDiv changent et certaines pages sont vides. On fera alors un mixe des deux options, on utilisera des regEx uniquement quand on aura pas le choix.

Pour crawler une page on fonctionne de la manière suivante (fonction proceedRequest dans le code):

1) On request la page.
2) Une fois la promesse est resolu, à l'aide de la librairie cheerio, on selectionne les éléments que l'on souhaite et on extrait le texte.
3) On applique des regEx pour les mettre sous le bon format puis on stock le tout dans un objet js.

*A noté que dans la fonction, on push cela dans une list spells, pour pouvoir après l'inséré dans un fichier JSON pour l'utilisé avec spark*

Pour crawler plusieurs pages, j'ai eu **deux approches** ! Oui oui, deux car la première, était un peu trop gourmande pour le site:

La première approche fonctionné de la façon suivante:

Vue que l'on travaille en asynchrone, on travaille avec des promesses, il fallait donc les chaîner. La première idée qui m'est venu, était de créer une liste d'URL puis de mapper cette liste avec la fonction proceedRequest. Puis une fois que toutes les promesses étaient résolus, d'écrire la liste des spells dans un fichier JSON.

Voici le code:

![code approche 1](https://i.imgur.com/KZwIn5d.png)

On se dit que c'est bon, tout va fonctionner:
![It's free real estate](https://i.kym-cdn.com/entries/icons/original/000/021/311/free.jpg)

Mais à mon grand désarroi, en fonction du nombres de requête, je provoquais des mini coupures du site:
![Erreur 503 dxcontent](https://media.discordapp.net/attachments/509134129779179531/537452878626029578/unknown.png)

Du coup, pour éviter de refaire planter le site, j'ai décidé de faire requête par requête dans une boucle (cf fonction crawl_all). C'est plus long et plate mais ça marche. 

![boucle crawl all](https://i.imgur.com/LxqMjWf.png)

Mais bon, j'ai mis des console log en couleurs du coups c'est joli.

![log crawling](https://i.imgur.com/lGHT8de.png)

*A note que sur cette image, le crawler n'était pas fini correctement, on peut voir des répétitions dans le nom à cause des sorts qui pouvait être mythique. C'est réglé, j'ai juste pas envie de relancer le programme pour reprendre un screen.*

Au final on crawl parmis les 1975 pages sur le site, 1973 car deux pages sont vides.


### Filter de la BDD avec Spark:

#### Avec RDD:
On crée un RDD à l'aide de notre fichier JSON. Puis on applique un filtre. 

Voici le code correspondant:

![spark filter code rdd](https://i.imgur.com/NwdUqik.png)

Voici le résultat d'éxecution:

![spark_filter_exec_rdd](https://i.imgur.com/o3c3Daq.png)

#### Avec un dataframe:

On crée un dataframe à l'aide de notre fichier JSON. Puis on applique un filtre:

Voici le code correspondant:

![spark_filter_code_sql](https://i.imgur.com/GQzx9Ll.png)

Voici le résultat d'éxecution:

![spark_filter_exec_sql](https://i.imgur.com/mEAZPec.png)


## Exercice 2

### Creation du graph

On doit réaliser un pagerank avec le graph suivant:

![Graph exercice 2](https://i.imgur.com/DvlqzdB.png)

On crée une class Page:

![Class page](https://i.imgur.com/ygyuIxH.png)

Puis on crée un graph en faisant une instance de cette classe par page, on le stocke ensuite dans un RDD:

![Graph](https://i.imgur.com/xsKAfXr.png)

### Pagerank

On va maintenant appliquer l'algorithme Pagerank sous Spark. Pour cela on va lister les étapes de ce que l'on doit faire:

1. Initialisation :
   * Pour chaque page initialiser le pagerank à 1. On la met sous la forme de pair (url, pagerank).
   * Pour chaque page crée une pair (url, adj_list). Cela nous permettra de calculer les contributions.
   * Pour chaque page, on crée une pair (url, 0). Cela nous permet que si une page n'a pas de contribution, lors du reduce, de quand même pouvoir calculer la valeur de la page. Ici c'est utile pour la page D. On appelle cette map **pages**.
2. On boucle. Pour chaque itération:
   *  Pour chaque url dans chaque adj_list des pages du graph, on crée une pair (url, rank / taille_adj_list). Le rank étant le pagerank de l'itération précédente ou de l'initialisation. On appelle cette map **outlink**.
   *  On fait l'union de la map **pages** et **outlink**. On appelle cette map **contribs**
   *  On reduce la map **contribs**. Pour chaque pair (url, pr), on regroupe les pair qui ont la même url en faisant la somme de leur pr.
   *  On map le reduce de l'étape précédente en remplaçant chaque pair (url, pr), par (url, (1 -d) + d * pr). On considére alors que ce sont nos nouvelles valeurs de pagerank pour chaque url.
  
Voici le code correspondant:

![code pagerank](https://i.imgur.com/RkcN9sR.png)

Voici le résultat d'éxecution:

![exec pagerank](https://i.imgur.com/A0yuhcC.png)

## Conclusion:

Le plus dur dans ce TP, c'est pas Spark. C'est l'installation de Spark sous Windows et la notation Scala qui est un peu barbare parfois.

![scala_syntaxe](https://i.imgflip.com/12llwx.jpg)
