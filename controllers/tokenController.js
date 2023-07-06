exports.verifyAuthToken  = async (req, res) => {
    return res.status(200).send(req.user);
}