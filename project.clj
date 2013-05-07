(defproject imageshop "0.1.0"
  :description "imageshop"
  :dependencies [[org.clojure/clojure "1.5.0"]                 
                 [clj-time/clj-time "0.4.4"]
                 [org.slf4j/slf4j-api "1.6.1"]
                 [org.slf4j/slf4j-jdk14 "1.6.1"]
                 [com.mysema.commons/mysema-commons-thumbs "0.1.8"]
                 [compojure "1.1.5"]
                 [ring/ring-jetty-adapter "1.1.6"]                 
                 [cheshire "5.0.0"]]
  :plugins [[lein-ring "0.8.2"]]
  :ring {:init imageshop.core/init
         :handler imageshop.core/app}
  :profiles {:dev {:dependencies [[midje "1.4.0"]                 
                                  [ring-mock "0.1.3"]] 
                   :plugins [[lein-midje "2.0.0-SNAPSHOT"]]}})
