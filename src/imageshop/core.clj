(ns imageshop.core  
  (:import [com.mysema.commons.thumbs ThumbFactory]
           [java.io File FileOutputStream]
           [javax.imageio ImageIO])
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            (ring.util [response :as res])
            (ring.middleware [multipart-params :as mp])
            [clojure.java.io :as io])
  (:use [compojure.core]
        [ring.adapter.jetty]
        [cheshire.core :only (generate-string)]))

(defn json 
  [content]
  (if content
    (-> {:body (generate-string content)}
        (res/content-type "application/json"))
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
  (let [imgFolder "target/"
        tbnFile (io/file (str imgFolder filename ".tbn.jpg"))
        data {:title filename :thumbnail (.getName tbnFile)}]
    (io/copy tempfile (io/file (str imgFolder filename)))
    (create-thumb tempfile tbnFile)
    (swap! images assoc filename data)    
    (json data)))

(defn get-images
  []
  ; TODO get dynamically
  (json (or (vals @images) [])))

(defroutes api-routes
  (GET "/api/images" [] (get-images))
  (GET "/images/:id" [id] (io/file (str "target/" id)))
  (mp/wrap-multipart-params
    (POST "/images" [file] (upload-file file))))

(defroutes web-routes
  (GET "/" []
    (res/redirect "index.html"))
  (route/resources "/"))

(defn init
  []
  (.mkdir (io/file "target")))

(def app (handler/site (routes web-routes api-routes)))

(defn start []
  (run-jetty app {:port 9080 :join? false}))