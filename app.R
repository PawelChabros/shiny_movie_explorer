library(extrafont)
library(lubridate)
library(stringr)
library(ggplot2)
library(shiny)
library(dplyr)
library(r2d3)
library(DT)

loadfonts(device = 'win')

load(url("http://s3.amazonaws.com/assets.datacamp.com/production/course_4850/datasets/movies.Rdata"))

num_feat <- c(
  "IMDB rating" = "imdb_rating", 
  "IMDB number of votes" = "imdb_num_votes", 
  "Critics score" = "critics_score", 
  "Audience score" = "audience_score", 
  "Runtime" = "runtime"
)

fct_feat <- c(
  "Title type" = "title_type",
  "Genre" = "genre",
  "MPAA rating" = "mpaa_rating",
  "Critics rating" = "critics_rating",
  "Audience rating" = "audience_rating"
)

min_date <- min(movies$thtr_rel_date)
max_date <- max(movies$thtr_rel_date)

ui <- fluidPage(
  
  theme = 'style.css',
  titlePanel('Movie explorer'),
  tags$hr(),
  
  sidebarLayout(
    sidebarPanel(
      selectInput(
        inputId = 'yAxis',
        label = 'Y-axis:',
        choices = num_feat
      ),
      selectInput(
        inputId = 'xAxis',
        label = 'X-axis:',
        choices = num_feat,
        selected = 'critics_score'
      ),
      selectInput(
        inputId = 'color',
        label = 'Color by:',
        choices = fct_feat
      ),
      dateRangeInput(
        inputId = 'date',
        label = 'Select dates:',
        start = '1970-05-20',
        end = '2014-12-25',
        min = min_date,
        max = max_date
      ),
      checkboxInput(
        inputId = 'showDT',
        label = 'show data frame',
        value = FALSE
      ),
      htmlOutput('list')
    ),
    mainPanel(
      tags$h4(textOutput('numOfMovies')),
      d3Output('scatterPlot')
    )
  ),
  tags$hr(),
  conditionalPanel(
    'input.showDT == true',
    dataTableOutput('table')
  )
)

server <- function(input, output) {
  
  movies_selected <- reactive({

    movies %>%
      filter(thtr_rel_date %>% between(
        as.POSIXct(input$date[1]),
        as.POSIXct(input$date[2])
      )) 
  })

  movies_d3 <- reactive({
    movies_selected() %>%
      select(input$xAxis, input$yAxis, input$color) %>%
      rename_all(~c('x', 'y', 'clr'))
  })
    
  movies_data_frame <- reactive({
    movies_selected() %>%
      select(title, input$xAxis, input$yAxis, input$color)
  })
  
  output$numOfMovies <- renderText({
    str_c('Number of movies ploted: ', nrow(movies_selected()))
  })
  
  output$scatterPlot <- renderD3({
      r2d3(
        data = movies_d3(),
        script = 'scatterPlot.js'
      )
    }
  )
  
  output$table <- renderDataTable({
      datatable(
        movies_data_frame(),
        style = 'bootstrap'
    )})
  
  output$list <- renderUI({
    movies_selected() %>%
      group_by(title_type) %>%
      count() %$%
      paste0('<li>', title_type, ': ', n, '</li>') %>%
      str_c(collapse = '') %>%
      str_c('<ul>', ., '</ul>') %>%
      HTML()
  })
}

shinyApp(ui = ui, server = server)

