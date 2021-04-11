local folder: Folder = Instance.new("Folder", owner.PlayerGui)

local disallowOtherPlayers = true

local invoke, emit
local onInvoke, on
do
	local remoteEvent: RemoteEvent = Instance.new("RemoteEvent", folder)
	local remoteFunction: RemoteFunction = Instance.new("RemoteFunction", folder)

	function invoke(event: string, ...)
		if type(event) ~= "string" then
			error("`event` must be a string")
		end

		return remoteFunction:InvokeClient(owner, event, ...)
	end

	function emit(event: string, ...)
		if type(event) ~= "string" then
			error("`event` must be a string")
		end

		remoteEvent:FireClient(owner, event, ...)
	end

	type AnyFunction = () -> any

	local invokeEvents = {}
	function onInvoke(event: string, f: AnyFunction, overwrite: boolean | nil) 
		if invokeEvents[event] and not overwrite then
			error("Attempt to overwrite an already existing invoke event. If you wish to overwrite, please pass a third `true` argument to onInvoke")
		end

		invokeEvents[event] = f
	end

	remoteFunction.OnServerInvoke = function(player, event, ...)
		if disallowOtherPlayers and player ~= owner then return end

		if event == nil then
			return script
		end

		local f = invokeEvents[event]
		if f then
			return f(...)
		end
	end


	local events = {}
	function on(event: string, f: AnyFunction)
		if events[event] then
			table.insert(events[event], f)
		else
			events[event] = {f}
		end
	end

	remoteEvent.OnServerEvent:Connect(function(player, event, ...)
		if disallowOtherPlayers and player ~= owner then return end

		local f = events[event]
		if f then
			for i = 1, #f do
				f[i](...)
			end
		end
	end)
end

local clientScript = NLS(__SBUNDLER__CLIENT__, folder)