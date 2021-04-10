local import, modules
do
	local cache = {}

	function import(name)
		if typeof(name) ~= "string" then
			error("Tried to import a non-string. Did you mean to use tostring?")
		end

		local c = cache[name]
		if c then
			return cache[name]
		else
			local m = modules[name]
			if not m then
				error("Module `"..name.."` not found.")
			end

			-- TODO: pcall
			m = m()
			cache[name] = m

			return m
		end
	end
end