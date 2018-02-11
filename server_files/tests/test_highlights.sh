#!/bin/bash 

# NYTimes Article Summary
printf "Summary Test: \n"
curl '127.0.0.1:8080/summary?article_url=https://www.nytimes.com/2018/02/03/us/politics/trump-fbi-justice.html?hp&action=click&pgtype=Homepage&clickSource=story-heading&module=first-column-region&region=top-news&WT.nav=top-news' 
printf "\n"


# NYTimes Article Highlights 
printf "Highlights Test: \n" 
curl '127.0.0.1:8080/highlights?article_url=https://www.nytimes.com/2018/02/03/us/politics/trump-fbi-justice.html?hp&action=click&pgtype=Homepage&clickSource=story-heading&module=first-column-region&region=top-news&WT.nav=top-news'
printf "\n"
