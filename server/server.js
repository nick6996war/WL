//Подключаем cтронние модули
const express = require("express")
const IncomingForm = require("formidable").IncomingForm
const cors = require("cors")
const Sequelize = require("sequelize")
const bodyParser = require('body-parser')
const fs = require('fs')
//подключаем БД и Sequelize
const sequelize = new Sequelize("data", "root", "root", {
    dialect: "mysql",
    host: "localhost"
})
//создаем класс Film по нужным параметрам согласно ТЗ
const Film = sequelize.define("film", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    releaseYear: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    format: {
        type: Sequelize.STRING,
        allowNull: false
    },
    stars: {
        type: Sequelize.TEXT,
        allowNull: false
    }
})
// проверяем соответствие класс == таблица в случае отсутствия создается таблица в БД
sequelize.sync().then(result => {
    console.log(result);
}).catch(err => console.log(err))

// Конфигурация express
const app = express()
let corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// функция отвечает за перевод файла sample_movies.txt в массив данных и записи даных в БД
function UploadFileParse(file) {
    //перевод в нижний регистр обязателен так как в БД все в нижнем регистре
    //делим на масив содиржащий все даные по одному фильму 
    let readSampleMovies = fs.readFileSync(file.path, 'utf8').toLowerCase().split('\r\n\r\n')
    //readSampleMovies.length - 2 => так как в конце файла примера 4 переноса строки  и в масиве 2 пустые ячейки в конце 
    for (let i = 0; i < readSampleMovies.length - 2; i++) {
        //переводим одномерный массив в ассоциативный двухмерный при помощи замены и подгонки исходной строки под формат JSON\
        dataMovie = JSON.parse('{' + readSampleMovies[i].replace(/title: /g, '\"title": "').replace(/release year: /g, '\"releaseYear": "').replace(/format: /g, '\"format": "').replace(/stars: /g, '\"stars": "').replace(/\r\n/g, '",') + '"}')
        //пишем фильм в БД
        Film.create({
            title: dataMovie.title,
            releaseYear: dataMovie.releaseYear,
            format: dataMovie.format,
            stars: dataMovie.stars
        }).then(res => {
            console.log(res);
        }).catch(err => console.log(err));
    }

}
// название говорит само за себя функция проверяет является ли переменная числом
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }


/* Глобальный роутер - Потдерживает четырехуровневый URL
что в даном случае много хватит и двухуровневого 
	Благодаря ему мы можем не писать лишних строк
*/
app.all('*', async function (req, res) {
    console.log(req, res)
    // Предусматриваем четырехуровневый URL
    let resource = ''
    let alias = ''
    let resource_id
    let resource_alias

    // Получаем и разбираем URL
    let urlArr = await req.originalUrl.split('/')
    if (urlArr[1]) resource = urlArr[1]
    if (urlArr[2]) alias = urlArr[2]
    if (urlArr[3]) resource_id = urlArr[3]
    if (urlArr[4]) resource_alias = urlArr[4]

    if (req.method == 'GET') {
        //запрос к БД для получения в алфавитном порядке ресурс и алиас не использываеться так как запрос GET на фронте только один
        Film.findAll({
            order: [
                ['title', 'ASC'],
            ], attributes: ['id', 'title', 'releaseYear', 'format', 'stars']
        }).then(films => {
            console.log(films)
            res.send(films)
        }).catch(err => console.log(err))
        //console.log(req.method)
    } else if (req.method == 'POST' && req.body) {
        //console.log(resource)
        if (resource == 'movie') {
            //console.log(alias)
            if (alias == 'search') {
                //console.log(req.body, req.body.post)
                if (req.body.post == "") {
                    //для получения списка всех фильмов отправьте пустой запрос POST
                    Film.findAll({ raw: true, attributes: ['id', 'title', 'releaseYear', 'format', 'stars'] }).then(films => {
                        res.send(films)
                    }).catch(err => console.log(err))
                } else {
                    // получениие фильма по названию
                    Film.findAll({ where: { title: req.body.post.toLowerCase() }, attributes: ['id', 'title', 'releaseYear', 'format', 'stars'] }).then(film => {
                        console.log(film)
                        //если нет совпадения по названию ищем фильми по актерам по не точному совпадению
                        if (film.length == 0) {
                            Film.findAll({ where: { stars: { [Sequelize.Op.substring]: req.body.post.toLowerCase() } }, attributes: ['id', 'title', 'releaseYear', 'format', 'stars'] }).then(films => {
                                console.log(films);
                                res.send(films);
                            }).catch(err => console.log(err));
                        } else {
                            res.send(film);
                        }

                    }).catch(err => console.log(err));

                }

            } else if (alias == 'add') {
                if (req.body.post != '')
                    // принимаем строку вида title,releaseYear,format,stars и делим ее на масив 
                    ArrDataMovie = req.body.post.toLowerCase().split(',')
                //console.log(ArrDataMovie)
                // отправляем масив в БД
                Film.create({
                    title: ArrDataMovie[0],
                    releaseYear: ArrDataMovie[1],
                    format: ArrDataMovie[2],
                    stars: ArrDataMovie[3]
                }).then(res => {
                    console.log(res);
                }).catch(err => console.log(err));
            } else if (alias == 'upload') {
                //обработчик загружки файлов 
                let form = new IncomingForm()
                form.on("file", (field, file) => {
                    UploadFileParse(file).catch(err => console.log(err))
                }).catch(err => console.log(err))
                form.on("end", () => {
                    res.json()
                })
                form.parse(req)
            }
        }
    } else if (req.method == 'DELETE') {
        //удаление фильма по Уникальному идентификатору если введено число
        if (isNumber(req.body.post)) {
            Film.destroy({ where: { id: req.body.post } })
        } else {
            //удаление фильма по названию 
            Film.destroy({ where: { title: req.body.post.toLowerCase() } })
        }
    }

})

app.listen(8080, function () {
    console.log("Сервер ожидает подключения...")
})

