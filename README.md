# TP1 de BDD repartie 



## Exercice 1

### Crawler

Le but de cette exercice est de réaliser un crawler recupérant les données d'un JdR. Le crawler a été realisé sous NodeJs, je vais décrire brievement sont fonctionnement.

Le premier plaisir de cette aventure, c'est la structure du site, qui n'est pas si pratique à crawler !
![architecture_web](https://i.imgur.com/hz2Q9CO.png)

On remarque d'entrée de jeu, que mis à part le heading, que l'on a pas tellement de moyen de selectionné facilement les éléments. Plusieurs options s'offrent à nous:

1. Utilisation de regEx
2. Sélection des enfants de .SpellDiv qui englobe toutes les données qui nous intéresse !

Autres problèmes, en fonction des pages, les ordres des enfants de .SpellDiv changent, certaines pages sont vides. On fera alors un mixe des deux options, on utilisera des regEx uniquement quand on aura pas le choix, car les regEx c'est plate à faire.

Pour crawler une page on fonctionne de la manière suivante (fonction proceedRequest dans le code):

1) On request la page
2) Une fois la promesse est resolu, à l'aide de la librairie cheerio, je selectionne les éléments que l'on souhaite et on extrait le text
3) On applique des regEx pour les mettre sous le bon format puis on stock ça dans un objet js.

*A noté que dans la fonction, on push cela dans une list spells, pour pouvoir après l'inséré dans un json pour l'utilisé avec spark*

Pour crawler plusieurs pages, j'ai eu **deux approches** ! Oui oui, deux car la première, était un peu trop gourmande pour le site:

La première approche fonctionné de la façon suivante:

Vue que l'on travaille en asynchrone, on travaille avec des promesses, il fallait donc les chaîner, la première idée qui m'est venu, était de crée une liste d'URL puis de mapper cette liste avec la fonction proceedRequest. Puis une fois que toutes les promesses étaient résolus, d'écrire dans un fichier JSON la liste des spells.

Voici le code:

![code approche 1](https://i.imgur.com/KZwIn5d.png)

On se dit, c'est bon, tout va fonctionner:
![It's free real estate](https://i.kym-cdn.com/entries/icons/original/000/021/311/free.jpg)

Mais à mon grand désarroi, en fonction du nombres de requête, je provoquais des mini coupures du sites:
![Erreur 503 dxcontent](https://media.discordapp.net/attachments/509134129779179531/537452878626029578/unknown.png)

Du coup, pour éviter de refaire planter le site, j'ai décidé de faire requête par requête dans une boucle (cf fonction crawl_all). C'est plus long et plate mais ça marche. 

![boucle crawl all](https://i.imgur.com/LxqMjWf.png)

Mais bon, j'ai mis des console log en couleurs du coups c'est joli.

![log crawling](https://i.imgur.com/lGHT8de.png)

Au final on crawl parmis les 1975 pages sur le sites, 1973 car deux pages sont vides.


### Filter de la BDD avec Spark:

#### Avec RDD:
On crée un RDD à l'aide de notre fichier JSON. Puis on applique un filtre. 

Voici le code correspondant:

![spark filter code rdd](https://imgur.com/a/tLh7qwU)

Voici le résultat d'éxecution:

![spark_filter_exec_rdd](https://i.imgur.com/o3c3Daq.png)

#### Avec un dataframe:

On crée un dataframe à l'aide de notre fichier JSON. Puis on applique un filtre:

Voici le code correspondant:

![spark_filter_code_sql](https://i.imgur.com/GQzx9Ll.png)

Voici le résultat d'éxecution:

![spark_filter_exec_sql](https://i.imgur.com/mEAZPec.png)


## Exercice 2

On doit réaliser un pagerank avec le graph suivant:

![Graph exercice 2](https://i.imgur.com/DvlqzdB.png)

On crée une class Page:

![Class page](https://i.imgur.com/ygyuIxH.png)

Puis on crée un graph en faisant une instance de cette classe par page, on le stocke ensuite dans un RDD:

![Graph](https://i.imgur.com/xsKAfXr.png)




