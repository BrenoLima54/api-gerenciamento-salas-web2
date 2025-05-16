module.exports = function (req, res, next) {
    
    const hoje = new Date().getDay();
    
    if(hoje == 0 || hoje == 6){
        return res.status(403).json({message: "Acesso não permitido aos finais de semana"});
    }

    next();
};