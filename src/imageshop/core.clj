(ns imageshop.core  
  (:import [com.mysema.commons.thumbs ThumbFactory]
           [java.io File FileOutputStream]
           [javax.imageio ImageIO])
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            (ring.util [response :as res])
            (ring.middleware [multipart-params :as mp])
            [clj-time.core :as time]
            [clj-time.format :as format]
            [clojure.java.io :as io])
  (:use [compojure.core]
        [ring.adapter.jetty]
        [ring.util.response :only (header)]
        [cheshire.core :only (generate-string)]))

(def rfc822 (format/formatter "EEE, dd MMM yyyy HH:mm:ss z"))

(defn json 
  [content]
  (if content
    (-> {:body (generate-string content)}
        (res/content-type "application/json"))
    (res/status {:body "Not found"} 404)))

(defn json-in-html
  [content]
  (if content
    (-> {:body (str "<textarea>" 
                    (generate-string content)
                    "</textarea>")}
        (res/content-type "text/html"))
    (res/status {:body "Not found"} 404)))
      

(defn create-thumb
  [^File file ^File tbnFile]
  (let [tbn (ThumbFactory/getThumbnail file 300 300)
        os (FileOutputStream. tbnFile)]
    (ImageIO/write tbn "jpeg" tbnFile)
    tbnFile))

(def images (atom {}))

(defn upload-file
  [{:keys [tempfile filename]}]  
  (let [filename (.substring filename (inc (.lastIndexOf filename "\\"))) 
        imgFolder "target/"
        tbnFile (io/file (str imgFolder filename ".tbn.jpg"))
        data {:title filename :thumbnail (.getName tbnFile)}]
    (io/copy tempfile (io/file (str imgFolder filename)))
    (create-thumb tempfile tbnFile)
    (swap! images assoc filename data)
    data))

(defn get-images
  []
  (or (vals @images) []))

(defn delete-image 
  [id]
  (.delete (io/file (str "target/" id)))
  (swap! images dissoc id))  

(defn get-operations
  []
  [{:id 1 :name "Lightning correction"} 
   {:id 2 :name "Red eye correction"}])

(defn ajax?
  [headers]
  (= (headers "x-requested-with") "XMLHttpRequest"))

(defroutes api-routes
  (GET "/api/images" [] 
       (json (get-images)))
  (DELETE "/api/images/:id" [id]
          (delete-image id))
  (GET "/api/operations" []
       (json (get-operations)))
  (GET "/images/:id" [id] 
       (io/file (str "target/" id)))
  (mp/wrap-multipart-params
    (POST "/images" {headers :headers params :params}
          ((if (ajax? headers) json json-in-html) 
            (upload-file (params :file))))))
         
(defroutes web-routes
  (GET "/" []
    (res/redirect "index.html"))
  (route/resources "/"))

(defn init
  []
  (.mkdir (io/file "target")))

(defn wrap-last-modified
  "Adds Last-Modified headers to response."
  [handler]
  (fn [req]
    (if-let [res (handler req)]
      (-> res          
          (header "Last-Modified" (format/unparse rfc822 (time/now)))
          (header "Cache-Control" "max-age=0")))))

(def app
  (-> (wrap-last-modified api-routes) 
      (routes web-routes)      
      handler/site))

(defn start []
  (run-jetty app {:port 9080 :join? false}))