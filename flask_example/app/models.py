from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    search_term = db.Column(db.String(64), index=True, unique=True)
    result = db.Column(db.String(120), index=True, unique=True)

    # for debugging purposes
    def __repr__(self):
        return '<User %r>' % (self.nickname)
