import withAuth from '../../middleware/withAuth';

function handler(req, res) {
  // This will only execute if the user is authenticated
  res.status(200).json({ message: 'This is a protected endpoint', user: req.user });
}

export default withAuth(handler);
